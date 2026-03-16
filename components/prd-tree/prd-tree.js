/**
 * PRD hierarchy tree view component.
 *
 * Renders a collapsible/expandable tree of epics → features → tasks → subtasks
 * with status indicators, progress bars, completion percentages, and
 * modifier-key multi-select for bulk operations (status update, merge).
 *
 * Uses virtual scrolling to render only items within the viewport plus a
 * configurable buffer zone. The tree is flattened into a linear array
 * respecting expansion state and status filters, then only visible items
 * are rendered — dramatically reducing DOM node count for large trees.
 *
 * Event handling uses delegation: a single set of click / contextmenu / keydown
 * listeners on the `[role="tree"]` container replaces per-node handlers, reducing
 * total listener count from O(N × 6) to O(1).
 *
 * @see ./virtual-scroll.ts      — tree flattening and viewport computation
 * @see ./tree-event-delegate.ts  — delegated event handling hook
 */
import { h, Fragment, Component } from "preact";
import { useState, useMemo, useCallback, useEffect, useRef } from "preact/hooks";
import { computeBranchStats, completionRatio, formatTimestamp } from "./compute.js";
import { isWorkItem } from "./levels.js";
import { defaultStatusFilter } from "./status-filter.js";
import { InlineAddForm } from "./inline-add-form.js";
import { InlineStatusPicker } from "./inline-status-picker.js";
import { resolveTaskUtilization } from "./task-utilization.js";
import { useTreeEventDelegation } from "./tree-event-delegate.js";
import { flattenVisibleTree, useVirtualScroll, findFlatNodeIndex } from "./virtual-scroll.js";
import { highlightSearchText } from "./tree-search.js";
/** Levels that can have children added via inline form. */
const ADDABLE_LEVELS = new Set(["epic", "feature", "task"]);
// ── Status rendering ────────────────────────────────────────────────
const STATUS_CONFIG = {
    completed: { icon: "●", cssClass: "prd-status-completed", label: "Completed" },
    in_progress: { icon: "◐", cssClass: "prd-status-in-progress", label: "In Progress" },
    pending: { icon: "○", cssClass: "prd-status-pending", label: "Pending" },
    failing: { icon: "⚠", cssClass: "prd-status-failing", label: "Failing" },
    deferred: { icon: "◌", cssClass: "prd-status-deferred", label: "Deferred" },
    blocked: { icon: "⊘", cssClass: "prd-status-blocked", label: "Blocked" },
    deleted: { icon: "✕", cssClass: "prd-status-deleted", label: "Deleted" },
};
const PRIORITY_CONFIG = {
    critical: { cssClass: "prd-priority-critical" },
    high: { cssClass: "prd-priority-high" },
    medium: { cssClass: "prd-priority-medium" },
    low: { cssClass: "prd-priority-low" },
};
const LEVEL_LABELS = {
    epic: "Epic",
    feature: "Feature",
    task: "Task",
    subtask: "Subtask",
};
// ── Helper: collect all node IDs up to a depth ──────────────────────
function collectIdsToDepth(items, maxDepth, currentDepth = 0) {
    const ids = new Set();
    if (currentDepth >= maxDepth)
        return ids;
    for (const item of items) {
        ids.add(item.id);
        if (item.children && item.children.length > 0) {
            for (const id of collectIdsToDepth(item.children, maxDepth, currentDepth + 1)) {
                ids.add(id);
            }
        }
    }
    return ids;
}
// ── Sub-components ──────────────────────────────────────────────────
function StatusIndicator({ status }) {
    const config = STATUS_CONFIG[status];
    return h("span", {
        class: `prd-status-icon ${config.cssClass}`,
        title: config.label,
        "aria-label": config.label,
    }, config.icon);
}
function PriorityBadge({ priority }) {
    const config = PRIORITY_CONFIG[priority];
    return h("span", { class: `prd-priority-badge ${config.cssClass}` }, priority);
}
function ProgressBar({ ratio }) {
    const pct = Math.round(ratio * 100);
    const barClass = pct >= 100 ? "prd-bar-done" : pct >= 50 ? "prd-bar-mid" : "prd-bar-low";
    return h("div", {
        class: "prd-progress-wrapper",
        title: `${pct}% complete`,
        role: "progressbar",
        "aria-valuenow": String(pct),
        "aria-valuemin": "0",
        "aria-valuemax": "100",
        "aria-label": `${pct}% complete`,
    }, h("div", { class: "prd-progress-track", "aria-hidden": "true" }, h("div", {
        class: `prd-progress-fill ${barClass}`,
        style: `width: ${pct}%`,
    })), h("span", { class: "prd-progress-pct", "aria-hidden": "true" }, `${pct}%`));
}
function TagList({ tags }) {
    return h("span", { class: "prd-tag-list" }, tags.map((tag) => h("span", { key: tag, class: "prd-tag" }, tag)));
}
function formatTokenCount(n) {
    if (n >= 1_000_000)
        return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)
        return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
}
function TimestampSuffix({ item }) {
    if (item.status === "completed" && item.completedAt) {
        const ts = formatTimestamp(item.completedAt);
        if (ts)
            return h("span", { class: "prd-timestamp" }, `done ${ts}`);
    }
    if (item.status === "in_progress" && item.startedAt) {
        const ts = formatTimestamp(item.startedAt);
        if (ts)
            return h("span", { class: "prd-timestamp" }, `started ${ts}`);
    }
    if (item.status === "failing" && item.failureReason) {
        return h("span", { class: "prd-timestamp prd-failure-reason" }, item.failureReason);
    }
    return null;
}
/**
 * Memoized single tree node.
 *
 * Structural sharing (tree-differ.ts) ensures unchanged items keep their
 * object reference across data updates. The `shouldComponentUpdate` check
 * leverages this: when `item` is the same reference AND all UI-state props
 * match, the node skips its entire render cycle — no VDOM diffing, no
 * `computeBranchStats`, no string concatenation.
 *
 * Uses Preact's native class component `shouldComponentUpdate` (no
 * preact/compat dependency) for maximum compatibility with the existing
 * test infrastructure and esbuild configuration.
 */
class NodeRow extends Component {
    shouldComponentUpdate(nextProps) {
        const p = this.props;
        // Reference equality for the item object — structural sharing makes
        // this cheap and sufficient when items haven't changed.
        if (p.item !== nextProps.item)
            return true;
        // UI state props — these are primitives so === works.
        if (p.isExpanded !== nextProps.isExpanded)
            return true;
        if (p.isSelected !== nextProps.isSelected)
            return true;
        if (p.isBulkSelected !== nextProps.isBulkSelected)
            return true;
        if (p.isInlineAddActive !== nextProps.isInlineAddActive)
            return true;
        if (p.isHighlighted !== nextProps.isHighlighted)
            return true;
        if (p.isDeleting !== nextProps.isDeleting)
            return true;
        if (p.depth !== nextProps.depth)
            return true;
        if (p.hasChildren !== nextProps.hasChildren)
            return true;
        if (p.canInlineAdd !== nextProps.canInlineAdd)
            return true;
        if (p.canDelete !== nextProps.canDelete)
            return true;
        if (p.showTokenBudget !== nextProps.showTokenBudget)
            return true;
        // taskUsage is an object — reference check (new object ⇒ re-render)
        if (p.taskUsage !== nextProps.taskUsage)
            return true;
        if (p.weeklyBudget !== nextProps.weeklyBudget)
            return true;
        if (p.searchQuery !== nextProps.searchQuery)
            return true;
        if (p.isSearchMatch !== nextProps.isSearchMatch)
            return true;
        // All props match — skip render
        return false;
    }
    render() {
        const { item, taskUsage, weeklyBudget, showTokenBudget, depth, isExpanded, hasChildren, isSelected, isBulkSelected, canInlineAdd, isInlineAddActive, isHighlighted, nodeRef, canDelete, isDeleting, searchQuery, isSearchMatch } = this.props;
        const children = item.children ?? [];
        const stats = hasChildren ? computeBranchStats(children) : null;
        const ratio = stats ? completionRatio(stats) : 0;
        const canAddChild = ADDABLE_LEVELS.has(item.level);
        const usage = taskUsage ?? {
            totalTokens: 0,
            runCount: 0,
            utilization: resolveTaskUtilization(0, weeklyBudget),
        };
        const utilization = usage.utilization ?? resolveTaskUtilization(usage.totalTokens, weeklyBudget);
        const indent = depth * 24;
        return h("div", {
            class: `prd-node-row${hasChildren ? " prd-node-expandable" : ""}${isSelected ? " prd-node-selected" : ""}${isBulkSelected ? " prd-node-bulk-selected" : ""}${isHighlighted ? " prd-node-highlighted" : ""}${isDeleting ? " prd-node-deleting" : ""}${isSearchMatch ? " prd-node-search-match" : ""} prd-level-${item.level}`,
            style: `padding-left: ${indent + 8}px`,
            // Data attributes for delegated event handling
            "data-node-id": item.id,
            ...(hasChildren ? { "data-has-children": "" } : {}),
            role: "treeitem",
            "aria-expanded": hasChildren ? String(isExpanded) : undefined,
            "aria-selected": String(isBulkSelected || isSelected),
            tabIndex: 0,
            ref: nodeRef,
        }, 
        // Chevron
        h("span", {
            class: `prd-chevron${hasChildren && isExpanded ? " prd-chevron-open" : ""}`,
            "aria-hidden": "true",
        }, hasChildren ? "\u25B6" : ""), 
        // Status icon
        h(StatusIndicator, { status: item.status }), 
        // Level badge
        h("span", { class: `prd-level-badge prd-level-${item.level}` }, LEVEL_LABELS[item.level]), 
        // Title (with search highlighting when query is active)
        h("span", { class: "prd-node-title", title: item.title }, ...(searchQuery ? highlightSearchText(item.title, searchQuery) : [item.title])), 
        // Priority
        item.priority
            ? h(PriorityBadge, { priority: item.priority })
            : null, 
        // Progress bar (for nodes with children)
        stats && stats.total > 0
            ? h(Fragment, null, h(ProgressBar, { ratio }), h("span", { class: "prd-count" }, `${stats.completed}/${stats.total}`))
            : null, 
        // Tags
        item.tags && item.tags.length > 0
            ? h(TagList, { tags: item.tags })
            : null, 
        // Aggregated task token usage — badge only renders for non-zero usage
        isWorkItem(item.level) && usage.totalTokens > 0
            ? h("span", {
                class: `prd-token-badge${showTokenBudget ? " prd-token-badge--budget" : ""}`,
                ...(showTokenBudget ? { "data-utilization-reason": utilization.reason } : {}),
                title: showTokenBudget
                    ? `${usage.runCount} associated run${usage.runCount === 1 ? "" : "s"} | ${utilization.label} weekly utilization`
                    : `${usage.runCount} associated run${usage.runCount === 1 ? "" : "s"}`,
            }, showTokenBudget
                ? `${formatTokenCount(usage.totalTokens)} tokens | ${utilization.label}`
                : `${formatTokenCount(usage.totalTokens)} tokens`)
            : null, 
        // Timestamp
        h(TimestampSuffix, { item }), 
        // ── Inline action group (hover-reveal) ──────────────────────────
        // Unified action row: [+Add] [✎Edit] [↕Status] [✕Delete]
        // All buttons use delegated click handling on the tree container.
        h("span", { class: "prd-node-actions" }, 
        // Add child (only for levels that support children)
        canAddChild && canInlineAdd
            ? h("button", {
                class: `prd-node-action prd-inline-add-btn${isInlineAddActive ? " active" : ""}`,
                title: `Add child to ${item.title}`,
                "aria-label": `Add child item to ${item.title}`,
                tabIndex: 0,
            }, "+")
            : null, 
        // Edit (opens detail panel)
        h("button", {
            class: "prd-node-action prd-node-action-edit",
            title: `Edit ${item.title}`,
            "aria-label": `Edit ${item.title}`,
            tabIndex: 0,
        }, "\u270E"), 
        // Change status (opens inline status picker)
        h("button", {
            class: "prd-node-action prd-node-action-status",
            title: `Change status of ${item.title}`,
            "aria-label": `Change status of ${item.title}`,
            tabIndex: 0,
        }, "\u21C5"), 
        // Delete
        canDelete
            ? h("button", {
                class: "prd-node-action prd-node-action-delete",
                title: `Delete ${LEVEL_LABELS[item.level]} "${item.title}"`,
                "aria-label": `Delete ${item.title}`,
                tabIndex: 0,
            }, "\u2717")
            : null));
    }
}
// ── Virtual tree renderer (flat, viewport-only) ─────────────────────
//
// Replaces the recursive TreeNodes + CulledNode + LazyChildren approach
// with a flat virtual-scrolled list. Only items within the viewport plus
// a buffer zone are rendered, dramatically reducing DOM node count for
// large trees. See virtual-scroll.ts for the flattening and range logic.
// ── Summary bar ─────────────────────────────────────────────────────
function SummaryBar({ items }) {
    const stats = computeBranchStats(items);
    const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const allSegments = [
        { status: "completed", count: stats.completed, label: "Completed" },
        { status: "in_progress", count: stats.inProgress, label: "In Progress" },
        { status: "pending", count: stats.pending, label: "Pending" },
        { status: "failing", count: stats.failing, label: "Failing" },
        { status: "blocked", count: stats.blocked, label: "Blocked" },
        { status: "deferred", count: stats.deferred, label: "Deferred" },
        { status: "deleted", count: stats.deleted, label: "Deleted" },
    ];
    const segments = allSegments.filter((s) => s.count > 0);
    return h("div", { class: "prd-summary" }, h("div", { class: "prd-summary-bar" }, segments.map((seg) => h("div", {
        key: seg.status,
        class: `prd-summary-segment prd-status-bg-${seg.status}`,
        style: `width: ${(seg.count / stats.total) * 100}%`,
        title: `${seg.label}: ${seg.count}`,
    }))), h("div", { class: "prd-summary-stats" }, segments.map((seg) => h("span", { key: seg.status, class: "prd-summary-stat" }, h("span", { class: `prd-status-dot ${STATUS_CONFIG[seg.status].cssClass}` }), `${seg.count} ${seg.label}`)), h("span", { class: "prd-summary-pct" }, `${pct}% complete (${stats.completed}/${stats.total})`)));
}
function Toolbar({ onExpandAll, onCollapseAll }) {
    return h("div", { class: "prd-toolbar" }, h("button", {
        class: "prd-toolbar-btn",
        onClick: onExpandAll,
        title: "Expand all nodes",
    }, "Expand All"), h("button", {
        class: "prd-toolbar-btn",
        onClick: onCollapseAll,
        title: "Collapse all nodes",
    }, "Collapse All"));
}
// ── Item lookup helper ──────────────────────────────────────────────
/** Build a flat Map of id → PRDItemData for O(1) lookup by the delegation hook. */
function buildItemMap(items) {
    const map = new Map();
    function walk(nodes) {
        for (const node of nodes) {
            map.set(node.id, node);
            if (node.children)
                walk(node.children);
        }
    }
    walk(items);
    return map;
}
export function PRDTree({ document: doc, taskUsageById, weeklyBudget, showTokenBudget, defaultExpandDepth = 2, onSelectItem, selectedItemId, bulkSelectedIds, onBulkSelect, onInlineAddSubmit, highlightedItemId, deepLinkExpandIds, onRemoveItem, onUpdateItem, deletingItemId, activeStatuses: externalStatuses, searchQuery, searchVisibleIds, searchMatchIds, chunkSize }) {
    // ── Flat item map for delegated event handlers ────────────────────
    const itemMap = useMemo(() => buildItemMap(doc.items), [doc.items]);
    const getItem = useCallback((id) => itemMap.get(id) ?? null, [itemMap]);
    // Collect all IDs for expand-all
    const allIds = useMemo(() => {
        const ids = new Set();
        function walk(items) {
            for (const item of items) {
                ids.add(item.id);
                if (item.children)
                    walk(item.children);
            }
        }
        walk(doc.items);
        return ids;
    }, [doc.items]);
    const [expanded, setExpanded] = useState(() => collectIdsToDepth(doc.items, defaultExpandDepth));
    // Deep-link: force-expand ancestor nodes so the target item is visible
    useEffect(() => {
        if (!deepLinkExpandIds || deepLinkExpandIds.size === 0)
            return;
        setExpanded((prev) => {
            const next = new Set(prev);
            for (const id of deepLinkExpandIds) {
                next.add(id);
            }
            return next;
        });
    }, [deepLinkExpandIds]);
    // Status filter: controlled (from parent) or internal fallback
    const [internalStatuses] = useState(() => defaultStatusFilter());
    const activeStatuses = externalStatuses ?? internalStatuses;
    // ── Virtual scroll ────────────────────────────────────────────────
    // Flatten the tree into a linear array respecting expansion and filter
    // state, then render only items within the viewport + buffer zone.
    // Search: auto-expand ancestors of matches so they're visible
    useEffect(() => {
        if (!searchVisibleIds || searchVisibleIds.size === 0)
            return;
        setExpanded((prev) => {
            const next = new Set(prev);
            // Expand all ancestors — searchVisibleIds includes ancestor IDs
            for (const id of searchVisibleIds) {
                next.add(id);
            }
            return next;
        });
    }, [searchVisibleIds]);
    const flatNodes = useMemo(() => flattenVisibleTree(doc.items, expanded, activeStatuses, 0, searchVisibleIds), [doc.items, expanded, activeStatuses, searchVisibleIds]);
    const scrollContainerRef = useRef(null);
    const virtualScroll = useVirtualScroll({
        flatNodes,
        containerRef: scrollContainerRef,
    });
    // Deep-link: scroll to the highlighted item via virtual scroll.
    const scrolledRef = useRef(false);
    useEffect(() => {
        if (!highlightedItemId) {
            scrolledRef.current = false;
            return;
        }
        if (scrolledRef.current)
            return;
        const idx = findFlatNodeIndex(flatNodes, highlightedItemId);
        if (idx >= 0) {
            scrolledRef.current = true;
            // Defer so the DOM has settled after ancestor expansion
            requestAnimationFrame(() => {
                virtualScroll.scrollToIndex(idx);
            });
        }
    }, [highlightedItemId, flatNodes, virtualScroll.scrollToIndex]);
    // Ref callback for the highlighted node (scroll-into-view fallback).
    const deepLinkNodeRef = useCallback((el) => {
        if (el && highlightedItemId) {
            // The virtual scroll centers the item; this ensures sub-pixel alignment.
            requestAnimationFrame(() => {
                el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });
        }
    }, [highlightedItemId]);
    // Inline add form state — tracks which parent node has its form open
    const [inlineAddParentId, setInlineAddParentId] = useState(null);
    const handleInlineAdd = useCallback((item) => {
        // Toggle: if already open for this item, close it; otherwise open it
        setInlineAddParentId((prev) => (prev === item.id ? null : item.id));
        // Auto-expand the node so the form is visible in context
        setExpanded((prev) => {
            const next = new Set(prev);
            next.add(item.id);
            return next;
        });
    }, []);
    const handleInlineAddCancel = useCallback(() => {
        setInlineAddParentId(null);
    }, []);
    const handleInlineAddSubmit = useCallback(async (data) => {
        if (!onInlineAddSubmit)
            return;
        await onInlineAddSubmit(data);
        setInlineAddParentId(null);
    }, [onInlineAddSubmit]);
    const toggle = useCallback((id) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    }, []);
    const expandAll = useCallback(() => setExpanded(new Set(allIds)), [allIds]);
    const collapseAll = useCallback(() => setExpanded(new Set()), []);
    // ── Inline status picker state ──────────────────────────────────────
    const [statusPicker, setStatusPicker] = useState(null);
    const handleStatusClick = useCallback((item, anchorRect) => {
        setStatusPicker((prev) => (prev?.item.id === item.id ? null : { item, anchorRect }));
    }, []);
    const handleStatusPickerClose = useCallback(() => {
        setStatusPicker(null);
    }, []);
    const handleStatusChange = useCallback((status) => {
        if (!statusPicker || !onUpdateItem)
            return;
        onUpdateItem(statusPicker.item.id, { status });
    }, [statusPicker, onUpdateItem]);
    // ── Bulk select wrapper (injects visible IDs) ────────────────────
    // The tree owns the flat node list; the consumer needs it for
    // shift-range computation but shouldn't have to compute it itself.
    const handleBulkSelectWrapped = useCallback((item, modifiers) => {
        if (!onBulkSelect)
            return;
        const visibleIds = flatNodes.map((n) => n.item.id);
        onBulkSelect(item, modifiers, visibleIds);
    }, [onBulkSelect, flatNodes]);
    // ── Delegated event handlers ──────────────────────────────────────
    // A single set of click / contextmenu / keydown listeners on the tree
    // container replaces the per-node handlers that were previously on every
    // NodeRow. See tree-event-delegate.ts for routing logic.
    const treeHandlers = useTreeEventDelegation({
        getItem,
        onToggle: toggle,
        onSelectItem,
        onBulkSelect: onBulkSelect ? handleBulkSelectWrapped : undefined,
        onInlineAdd: onInlineAddSubmit ? handleInlineAdd : undefined,
        onRemoveItem,
        onStatusClick: onUpdateItem ? handleStatusClick : undefined,
        expanded,
    });
    if (doc.items.length === 0) {
        return h("div", { class: "prd-empty" }, h("p", null, "No PRD items yet."), h("p", { class: "prd-empty-hint" }, "Run ", h("code", null, "rex add epic --title=\"...\""), " to get started."));
    }
    // Determine if inline add form should render for each visible node
    const canInlineAdd = !!onInlineAddSubmit;
    const canDelete = !!onRemoveItem;
    return h("div", { class: "prd-tree-container" }, 
    // Header
    h("div", { class: "prd-header" }, h("h2", { class: "prd-title" }, doc.title), h(Toolbar, { onExpandAll: expandAll, onCollapseAll: collapseAll })), 
    // Summary
    h(SummaryBar, { items: doc.items }), 
    // Tree — virtual scroll container with delegated event handlers
    h("div", {
        ref: scrollContainerRef,
        class: "prd-tree prd-tree-virtual",
        role: "tree",
        "aria-label": "PRD hierarchy",
        onScroll: virtualScroll.onScroll,
        onClick: treeHandlers.onClick,
        onKeyDown: treeHandlers.onKeyDown,
    }, 
    // Spacer before visible items (maintains scroll position)
    virtualScroll.offsetY > 0
        ? h("div", {
            class: "prd-virtual-spacer",
            style: `height: ${virtualScroll.offsetY}px`,
            "aria-hidden": "true",
        })
        : null, 
    // Visible items — flat rendering from virtual scroll
    virtualScroll.visibleNodes.map((node) => {
        const { item, depth, isExpanded, hasChildren } = node;
        const isInlineAddActive = inlineAddParentId === item.id;
        const isHL = highlightedItemId === item.id;
        return h(Fragment, { key: item.id }, h(NodeRow, {
            item,
            taskUsage: taskUsageById?.[item.id],
            weeklyBudget,
            showTokenBudget,
            depth,
            isExpanded,
            hasChildren,
            isSelected: selectedItemId === item.id,
            isBulkSelected: bulkSelectedIds?.has(item.id),
            canInlineAdd,
            isInlineAddActive,
            isHighlighted: isHL,
            nodeRef: isHL ? deepLinkNodeRef : undefined,
            canDelete,
            isDeleting: deletingItemId === item.id,
            searchQuery,
            isSearchMatch: searchMatchIds?.has(item.id),
        }), 
        // Inline add form — rendered below the parent node
        isInlineAddActive && onInlineAddSubmit
            ? h(InlineAddForm, {
                parentLevel: item.level,
                parentId: item.id,
                depth,
                onSubmit: handleInlineAddSubmit,
                onCancel: handleInlineAddCancel,
            })
            : null);
    }), 
    // Spacer after visible items (maintains total scroll height)
    virtualScroll.afterSpaceHeight > 0
        ? h("div", {
            class: "prd-virtual-spacer",
            style: `height: ${virtualScroll.afterSpaceHeight}px`,
            "aria-hidden": "true",
        })
        : null, 
    // Inline status picker (tree-level state, renders as anchored popover)
    statusPicker && onUpdateItem
        ? h(InlineStatusPicker, {
            currentStatus: statusPicker.item.status,
            anchorRect: statusPicker.anchorRect,
            onSelect: handleStatusChange,
            onClose: handleStatusPickerClose,
        })
        : null));
}
//# sourceMappingURL=prd-tree.js.map
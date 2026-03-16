/**
 * Virtual scrolling engine for the PRD tree.
 *
 * Flattens the hierarchical tree into a linear array respecting expansion
 * state and status filters, then computes which items fall within the
 * current scroll viewport plus a configurable buffer zone. Only those
 * items are rendered, dramatically reducing DOM node count for large trees.
 *
 * The module exposes:
 * - Pure functions for flattening and range computation (easily testable)
 * - A Preact hook (`useVirtualScroll`) for scroll state management
 *
 * @see ./prd-tree.ts — integrating component
 * @see ./compute.ts  — itemMatchesFilter used for visibility checks
 */
import { useState, useEffect, useRef, useMemo, useCallback } from "preact/hooks";
import { itemMatchesFilter } from "./compute.js";
import { itemMatchesSearch } from "./tree-search.js";
// ── Constants ─────────────────────────────────────────────────────────────────
/** Default estimated row height in pixels. */
export const DEFAULT_ITEM_HEIGHT = 40;
/** Default number of buffer items above and below viewport. */
export const DEFAULT_BUFFER_COUNT = 10;
// ── Pure functions ────────────────────────────────────────────────────────────
/**
 * Flatten a hierarchical tree into a linear array of FlatNodes.
 *
 * Only includes nodes that:
 * 1. Match the status filter (or have descendants that match)
 * 2. Are within expanded parent branches
 *
 * The result preserves render order (depth-first, pre-order traversal).
 * This is the same ordering that the recursive TreeNodes renderer produced,
 * but in a flat array suitable for virtual scrolling.
 *
 * Complexity: O(V) where V = visible nodes in the expanded tree.
 */
export function flattenVisibleTree(items, expanded, activeStatuses, depth = 0, searchVisibleIds) {
    const result = [];
    for (const item of items) {
        if (!itemMatchesFilter(item, activeStatuses))
            continue;
        // When a search is active, skip items not in the visible set.
        if (searchVisibleIds && searchVisibleIds.size > 0) {
            if (!itemMatchesSearch(item, searchVisibleIds))
                continue;
        }
        const children = item.children ?? [];
        const hasChildren = children.length > 0;
        const isExpanded = expanded.has(item.id);
        result.push({ item, depth, isExpanded, hasChildren });
        if (hasChildren && isExpanded) {
            const childNodes = flattenVisibleTree(children, expanded, activeStatuses, depth + 1, searchVisibleIds);
            for (const cn of childNodes)
                result.push(cn);
        }
    }
    return result;
}
/**
 * Compute the visible range of indices for the current scroll position.
 *
 * Returns start/end indices and the pixel offset for positioning.
 * Buffer items are included above and below the viewport to prevent
 * flashing during rapid scrolling.
 *
 * When containerHeight is 0 (unmeasured or jsdom), returns the full
 * range so all items render — virtual scrolling activates once the
 * container has a measured height.
 */
export function computeVisibleRange(scrollTop, containerHeight, totalCount, itemHeight = DEFAULT_ITEM_HEIGHT, bufferCount = DEFAULT_BUFFER_COUNT) {
    if (totalCount === 0) {
        return { start: 0, end: 0, offsetY: 0 };
    }
    // Fallback: container not yet measured — render everything.
    if (containerHeight <= 0) {
        return { start: 0, end: totalCount, offsetY: 0 };
    }
    const startIdx = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const start = Math.max(0, startIdx - bufferCount);
    const end = Math.min(totalCount, startIdx + visibleCount + bufferCount);
    const offsetY = start * itemHeight;
    return { start, end, offsetY };
}
/**
 * Find the index of an item in the flat node list by ID.
 * Returns -1 if not found.
 */
export function findFlatNodeIndex(flatNodes, itemId) {
    for (let i = 0; i < flatNodes.length; i++) {
        if (flatNodes[i].item.id === itemId)
            return i;
    }
    return -1;
}
/**
 * Preact hook that manages virtual scroll state.
 *
 * Observes the container element's height via ResizeObserver and
 * computes which items to render based on the current scroll position.
 *
 * When the container height is unmeasured (0), all items are returned
 * as visible — virtual scrolling activates once the browser reports
 * a real height. This handles initial render, jsdom tests, and SSR.
 */
export function useVirtualScroll({ flatNodes, containerRef, config = {}, }) {
    const itemHeight = config.itemHeight ?? DEFAULT_ITEM_HEIGHT;
    const bufferCount = config.bufferCount ?? DEFAULT_BUFFER_COUNT;
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    // Measure container height on mount and resize.
    useEffect(() => {
        const el = containerRef.current;
        if (!el)
            return;
        setContainerHeight(el.clientHeight);
        if (typeof ResizeObserver === "undefined")
            return;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerHeight(entry.contentRect.height);
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [containerRef]);
    // Reset scrollTop when flatNodes changes significantly (e.g. filter change).
    const prevLengthRef = useRef(flatNodes.length);
    useEffect(() => {
        if (prevLengthRef.current !== flatNodes.length) {
            prevLengthRef.current = flatNodes.length;
            // Don't reset scroll on small changes (expand/collapse).
            // Only reset when the change is dramatic (e.g. filter switch).
            if (Math.abs(prevLengthRef.current - flatNodes.length) > flatNodes.length * 0.5) {
                setScrollTop(0);
            }
        }
    }, [flatNodes.length]);
    const totalHeight = flatNodes.length * itemHeight;
    const isActive = containerHeight > 0;
    const range = useMemo(() => computeVisibleRange(scrollTop, containerHeight, flatNodes.length, itemHeight, bufferCount), [scrollTop, containerHeight, flatNodes.length, itemHeight, bufferCount]);
    const visibleNodes = useMemo(() => flatNodes.slice(range.start, range.end), [flatNodes, range.start, range.end]);
    const afterSpaceHeight = Math.max(0, totalHeight - range.offsetY - visibleNodes.length * itemHeight);
    const onScroll = useCallback((e) => {
        const target = e.target;
        setScrollTop(target.scrollTop);
    }, []);
    const scrollToIndex = useCallback((index) => {
        const el = containerRef.current;
        if (!el)
            return;
        // Center the item in the viewport.
        const targetScroll = Math.max(0, index * itemHeight - containerHeight / 2 + itemHeight / 2);
        el.scrollTop = targetScroll;
    }, [containerRef, itemHeight, containerHeight]);
    return {
        visibleNodes,
        totalHeight,
        offsetY: range.offsetY,
        afterSpaceHeight,
        onScroll,
        scrollToIndex,
        renderedCount: visibleNodes.length,
        totalCount: flatNodes.length,
        isActive,
    };
}
//# sourceMappingURL=virtual-scroll.js.map
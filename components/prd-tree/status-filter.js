/**
 * Status filter controls for the PRD tree view.
 *
 * Renders a row of toggleable status chips that control which items
 * are visible in the tree. All statuses are enabled by default.
 * Quick filter presets provide one-click access to common combinations.
 */
import { h } from "preact";
import { useCallback, useMemo } from "preact/hooks";
/** All available statuses in display order. */
export const ALL_STATUSES = [
    "pending",
    "in_progress",
    "completed",
    "failing",
    "blocked",
    "deferred",
    "deleted",
];
/** Human-readable labels and icons for each status. */
const STATUS_DISPLAY = {
    pending: { icon: "\u25CB", label: "Pending", cssClass: "prd-status-pending" },
    in_progress: { icon: "\u25D0", label: "In Progress", cssClass: "prd-status-in-progress" },
    completed: { icon: "\u25CF", label: "Completed", cssClass: "prd-status-completed" },
    failing: { icon: "\u26A0", label: "Failing", cssClass: "prd-status-failing" },
    blocked: { icon: "\u2298", label: "Blocked", cssClass: "prd-status-blocked" },
    deferred: { icon: "\u25CC", label: "Deferred", cssClass: "prd-status-deferred" },
    deleted: { icon: "\u2715", label: "Deleted", cssClass: "prd-status-deleted" },
};
/** Predefined filter presets in display order. */
export const FILTER_PRESETS = [
    {
        key: "all",
        label: "All Items",
        title: "Show all statuses including deleted",
        statuses: new Set(ALL_STATUSES),
    },
    {
        key: "active",
        label: "Active Work",
        title: "Show pending, in progress, failing, and blocked items",
        statuses: new Set(["pending", "in_progress", "failing", "blocked"]),
    },
    {
        key: "completed",
        label: "Completed",
        title: "Show only completed items",
        statuses: new Set(["completed"]),
    },
    {
        key: "blocked-deferred",
        label: "Blocked/Deferred",
        title: "Show blocked and deferred items that need attention",
        statuses: new Set(["blocked", "deferred"]),
    },
];
/**
 * Determine which preset (if any) matches the current active statuses.
 * Returns the preset key or null if no preset matches exactly.
 */
export function activePresetKey(activeStatuses) {
    for (const preset of FILTER_PRESETS) {
        if (activeStatuses.size === preset.statuses.size &&
            [...preset.statuses].every((s) => activeStatuses.has(s))) {
            return preset.key;
        }
    }
    return null;
}
export function StatusFilter({ activeStatuses, onChange }) {
    const toggleStatus = useCallback((status) => {
        const next = new Set(activeStatuses);
        if (next.has(status)) {
            // Don't allow deselecting all statuses
            if (next.size <= 1)
                return;
            next.delete(status);
        }
        else {
            next.add(status);
        }
        onChange(next);
    }, [activeStatuses, onChange]);
    const currentPreset = useMemo(() => activePresetKey(activeStatuses), [activeStatuses]);
    return h("div", { class: "prd-status-filter", role: "group", "aria-label": "Filter by status" }, 
    // Filter label
    h("span", { class: "prd-status-filter-label" }, "Filter:"), 
    // Quick presets
    h("div", { class: "prd-status-filter-presets" }, FILTER_PRESETS.map((preset) => h("button", {
        key: preset.key,
        class: `prd-status-preset${currentPreset === preset.key ? " active" : ""}`,
        onClick: () => onChange(new Set(preset.statuses)),
        title: preset.title,
        "aria-pressed": String(currentPreset === preset.key),
        type: "button",
    }, preset.label)), 
    // Custom indicator when no preset matches
    currentPreset === null
        ? h("span", { class: "prd-status-preset-custom", title: "Custom filter combination" }, "Custom")
        : null), 
    // Status chips
    h("div", { class: "prd-status-filter-chips", role: "toolbar", "aria-label": "Status chip toggles" }, ALL_STATUSES.map((status) => {
        const display = STATUS_DISPLAY[status];
        const isActive = activeStatuses.has(status);
        return h("button", {
            key: status,
            class: `prd-status-chip${isActive ? " active" : ""} ${display.cssClass}`,
            onClick: () => toggleStatus(status),
            title: `${isActive ? "Hide" : "Show"} ${display.label.toLowerCase()} items`,
            "aria-pressed": String(isActive),
            type: "button",
            onKeyDown: (e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    const next = e.currentTarget.nextElementSibling;
                    next?.focus();
                }
                if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const prev = e.currentTarget.previousElementSibling;
                    prev?.focus();
                }
            },
        }, h("span", { class: "prd-status-chip-icon" }, display.icon), h("span", { class: "prd-status-chip-label" }, display.label));
    })));
}
/** Default set of visible statuses (active work: pending, in progress, failing, blocked). */
export function defaultStatusFilter() {
    return new Set(["pending", "in_progress", "failing", "blocked"]);
}
//# sourceMappingURL=status-filter.js.map
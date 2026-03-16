import { h, Fragment } from "preact";
import { useState, useCallback } from "preact/hooks";
const STORAGE_PREFIX = "collapsible-section:";
/** Read persisted open/closed state, falling back to defaultOpen. */
function getPersistedState(storageKey, defaultOpen) {
    if (!storageKey)
        return defaultOpen;
    try {
        const stored = localStorage.getItem(STORAGE_PREFIX + storageKey);
        if (stored === "true")
            return true;
        if (stored === "false")
            return false;
    }
    catch {
        // localStorage unavailable
    }
    return defaultOpen;
}
export function CollapsibleSection({ title, count, defaultOpen = true, threshold = 8, storageKey, children, }) {
    const raw = Array.isArray(children) ? children : children ? [children] : [];
    const items = raw.flat().filter(Boolean);
    const total = count ?? items.length;
    const needsCollapse = items.length > threshold;
    const [open, setOpenRaw] = useState(() => getPersistedState(storageKey, defaultOpen));
    const [expanded, setExpanded] = useState(false);
    const setOpen = useCallback((next) => {
        setOpenRaw(next);
        if (storageKey) {
            try {
                localStorage.setItem(STORAGE_PREFIX + storageKey, String(next));
            }
            catch { /* noop */ }
        }
    }, [storageKey]);
    const visibleItems = needsCollapse && !expanded ? items.slice(0, threshold) : items;
    const hiddenCount = items.length - threshold;
    return h("div", { class: "mb-16" }, h("div", {
        class: "collapsible-header",
        onClick: () => setOpen(!open),
        role: "button",
        tabIndex: 0,
        "aria-expanded": String(open),
        onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(!open);
            }
        },
    }, h("span", { class: `collapsible-chevron ${open ? "open" : ""}`, "aria-hidden": "true" }, "\u25B6"), h("span", { class: "collapsible-title" }, title), total > 0
        ? h("span", { class: "collapsible-count" }, String(total))
        : null), open
        ? h(Fragment, null, needsCollapse && expanded
            ? h("div", { class: "collapsible-scroll-container" }, items, h("div", { class: "collapsible-sticky-footer" }, h("button", {
                class: "collapsible-toggle",
                onClick: () => setExpanded(false),
            }, "Show less")))
            : h(Fragment, null, visibleItems, needsCollapse
                ? h("button", {
                    class: "collapsible-toggle",
                    onClick: () => setExpanded(true),
                }, `Show ${hiddenCount} more`)
                : null))
        : null);
}
//# sourceMappingURL=collapsible-section.js.map
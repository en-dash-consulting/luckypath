/**
 * Inline status picker — compact popover for changing item status.
 *
 * Appears anchored below the status action button in a tree node row.
 * Designed to replace the old right-click context menu pattern with a
 * predictable, keyboard-accessible inline control.
 *
 * @see ./prd-tree.ts — PRDTree manages picker state at the tree level
 */
import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";
// ── Status options ──────────────────────────────────────────────────
const STATUS_OPTIONS = [
    { value: "pending", label: "Pending", icon: "○" },
    { value: "in_progress", label: "In Progress", icon: "◐" },
    { value: "completed", label: "Completed", icon: "●" },
    { value: "failing", label: "Failing", icon: "⚠" },
    { value: "blocked", label: "Blocked", icon: "⊘" },
    { value: "deferred", label: "Deferred", icon: "◌" },
    { value: "deleted", label: "Deleted", icon: "✕" },
];
export function InlineStatusPicker({ currentStatus, anchorRect, onSelect, onClose }) {
    const ref = useRef(null);
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                onClose();
            }
        };
        const handleKey = (e) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onClose();
            }
        };
        // Use capture for Escape so it fires before tree-level keydown
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey, true);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey, true);
        };
    }, [onClose]);
    // Focus the current-status button on mount for keyboard navigation
    useEffect(() => {
        if (!ref.current)
            return;
        const activeBtn = ref.current.querySelector(".prd-status-picker-option.active");
        if (activeBtn)
            activeBtn.focus();
    }, []);
    // Position: below the anchor button, clamped to viewport
    const pickerHeight = STATUS_OPTIONS.length * 32 + 8; // estimate
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const showAbove = spaceBelow < pickerHeight && anchorRect.top > pickerHeight;
    const style = {
        position: "fixed",
        left: `${Math.min(anchorRect.left, window.innerWidth - 160)}px`,
        zIndex: "9999",
    };
    if (showAbove) {
        style.bottom = `${window.innerHeight - anchorRect.top + 4}px`;
    }
    else {
        style.top = `${anchorRect.bottom + 4}px`;
    }
    return h("div", {
        ref,
        class: "prd-status-picker",
        style,
        role: "listbox",
        "aria-label": "Change status",
    }, STATUS_OPTIONS.map((opt) => h("button", {
        key: opt.value,
        class: `prd-status-picker-option prd-status-${opt.value}${currentStatus === opt.value ? " active" : ""}`,
        role: "option",
        "aria-selected": String(currentStatus === opt.value),
        onClick: (e) => {
            e.stopPropagation();
            if (opt.value !== currentStatus) {
                onSelect(opt.value);
            }
            onClose();
        },
        onKeyDown: (e) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                const next = e.currentTarget.nextElementSibling;
                if (next)
                    next.focus();
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                const prev = e.currentTarget.previousElementSibling;
                if (prev)
                    prev.focus();
            }
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (opt.value !== currentStatus) {
                    onSelect(opt.value);
                }
                onClose();
            }
        },
    }, h("span", { class: "prd-status-picker-icon" }, opt.icon), h("span", { class: "prd-status-picker-label" }, opt.label), currentStatus === opt.value
        ? h("span", { class: "prd-status-picker-check", "aria-hidden": "true" }, "✓")
        : null)));
}
//# sourceMappingURL=inline-status-picker.js.map
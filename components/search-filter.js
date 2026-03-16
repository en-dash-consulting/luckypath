import { h } from "preact";
export function SearchFilter({ placeholder = "Search...", value, onInput, resultCount, totalCount, filters, }) {
    return h("div", { role: "search" }, h("div", { class: "filter-bar" }, h("input", {
        class: "filter-input",
        type: "search",
        placeholder,
        value,
        "aria-label": placeholder,
        onInput: (e) => onInput(e.target.value),
    }), ...(filters ?? []).map((f) => h("select", {
        key: f.value,
        class: "filter-select",
        value: f.value,
        "aria-label": f.label,
        onChange: (e) => {
            const opt = f.options.find((o) => o.value === e.target.value);
            if (opt) {
                e.target.dispatchEvent(new CustomEvent("filter-change", { detail: opt.value }));
            }
        },
    }, f.options.map((o) => h("option", { key: o.value, value: o.value }, o.label)))), resultCount != null && totalCount != null
        ? h("span", {
            class: "filter-result-count",
            "aria-live": "polite",
        }, `Showing ${resultCount} of ${totalCount}`)
        : null));
}
//# sourceMappingURL=search-filter.js.map
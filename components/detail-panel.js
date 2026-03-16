import { h, Fragment } from "preact";
import { useEffect } from "preact/hooks";
import { meterClass, getZoneColorByIndex } from "../visualization/index.js";
import { basename } from "../utils.js";
export function DetailPanel({ detail, data, navigateTo, onClose, prdDetailContent }) {
    // Close on Escape
    useEffect(() => {
        if (!detail)
            return;
        const handleKey = (e) => {
            if (e.key === "Escape")
                onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [detail, onClose]);
    if (!detail)
        return null;
    let content;
    if (detail.type === "prd" && prdDetailContent) {
        content = prdDetailContent;
    }
    else if (detail.type === "file") {
        content = renderFileDetail(detail, data, navigateTo, onClose);
    }
    else if (detail.type === "zone") {
        content = renderZoneDetail(detail, data, navigateTo);
    }
    else {
        content = renderGenericDetail(detail);
    }
    return h(Fragment, null, 
    // Mobile backdrop
    h("div", {
        class: "detail-backdrop",
        onClick: onClose,
        "aria-hidden": "true",
    }), h("div", {
        class: "detail-panel open",
        role: "complementary",
        "aria-label": "Item details",
    }, h("div", {
        class: "detail-header",
    }, h("h3", { title: detail.title || "Details" }, detail.title || "Details"), h("button", {
        class: "detail-close",
        onClick: onClose,
        "aria-label": "Close detail panel",
        title: "Close (Esc)",
    }, "\u2715", h("span", { class: "sr-only" }, "Close"))), content));
}
function renderFileDetail(detail, data, navigateTo, onClose) {
    const path = detail.path;
    const imports = data?.imports;
    const zones = data?.zones;
    // Find zone membership
    let fileZone = null;
    if (zones) {
        for (let i = 0; i < zones.zones.length; i++) {
            const z = zones.zones[i];
            if (z.files.includes(path)) {
                fileZone = { id: z.id, name: z.name, color: getZoneColorByIndex(i) };
                break;
            }
        }
    }
    // Incoming and outgoing imports
    const incoming = imports?.edges.filter((e) => e.to === path).map((e) => e.from) ?? [];
    const outgoing = imports?.edges.filter((e) => e.from === path).map((e) => e.to) ?? [];
    return h(Fragment, null, 
    // Path in monospace
    h("div", { class: "detail-code" }, path), 
    // File metadata
    detail.language ? h("div", { class: "detail-row" }, h("span", { class: "label" }, "Language"), h("span", null, detail.language)) : null, detail.size ? h("div", { class: "detail-row" }, h("span", { class: "label" }, "Size"), h("span", null, detail.size)) : null, detail.lines ? h("div", { class: "detail-row" }, h("span", { class: "label" }, "Lines"), h("span", null, String(detail.lines))) : null, detail.role ? h("div", { class: "detail-row" }, h("span", { class: "label" }, "Role"), h("span", null, detail.role)) : null, detail.category ? h("div", { class: "detail-row" }, h("span", { class: "label" }, "Category"), h("span", null, detail.category)) : null, 
    // Zone badge
    fileZone
        ? h("div", { class: "detail-row" }, h("span", { class: "label" }, "Zone"), h("span", { class: "zone-badge", style: `--zone-color: ${fileZone.color}` }, fileZone.name))
        : null, 
    // Incoming imports
    incoming.length > 0
        ? h("div", { class: "mt-12" }, h("div", { class: "label mb-6" }, `Imported by (${incoming.length})`), h("div", { class: "detail-import-list" }, incoming.slice(0, 10).map((f) => h("div", { key: f, class: "detail-import-item", title: f }, basename(f))), incoming.length > 10
            ? h("div", { class: "detail-import-item text-dim" }, `... and ${incoming.length - 10} more`)
            : null))
        : null, 
    // Outgoing imports
    outgoing.length > 0
        ? h("div", { class: "mt-12" }, h("div", { class: "label mb-6" }, `Imports (${outgoing.length})`), h("div", { class: "detail-import-list" }, outgoing.slice(0, 10).map((f) => h("div", { key: f, class: "detail-import-item", title: f }, basename(f))), outgoing.length > 10
            ? h("div", { class: "detail-import-item text-dim" }, `... and ${outgoing.length - 10} more`)
            : null))
        : null, 
    // Navigation button
    navigateTo
        ? h("button", {
            class: "detail-nav-btn",
            onClick: () => navigateTo("graph", { file: path }),
        }, "\u2B95 View in Graph")
        : null);
}
function renderZoneDetail(detail, data, navigateTo) {
    const zoneId = detail.zoneId || detail.id;
    const zones = data?.zones;
    const zone = zones?.zones.find((z) => z.id === zoneId);
    const cohesion = parseFloat(detail.cohesion ?? String(zone?.cohesion ?? 0));
    const coupling = parseFloat(detail.coupling ?? String(zone?.coupling ?? 0));
    // Scoped findings
    const scopedFindings = zones?.findings?.filter((f) => f.scope === zoneId) ?? [];
    return h(Fragment, null, detail.description
        ? h("p", { class: "section-sub" }, detail.description)
        : null, 
    // File count
    h("div", { class: "detail-row" }, h("span", { class: "label" }, "Files"), h("span", null, String(detail.files))), 
    // Entry points
    zone && zone.entryPoints.length > 0
        ? h("div", { class: "mt-8" }, h("div", { class: "label" }, "Entry Points"), h("div", { class: "detail-import-list" }, zone.entryPoints.map((ep) => h("div", { key: ep, class: "detail-import-item", title: ep }, basename(ep)))))
        : null, 
    // Cohesion meter
    h("div", { class: "mt-12" }, h("div", { class: "detail-row" }, h("span", { class: "label" }, "Cohesion"), h("span", null, cohesion.toFixed(2))), h("div", { class: "meter" }, h("div", {
        class: `meter-fill ${meterClass(cohesion)}`,
        style: `width: ${cohesion * 100}%`,
    }))), 
    // Coupling meter
    h("div", { class: "mt-8" }, h("div", { class: "detail-row" }, h("span", { class: "label" }, "Coupling"), h("span", null, coupling.toFixed(2))), h("div", { class: "meter" }, h("div", {
        class: `meter-fill ${meterClass(coupling, true)}`,
        style: `width: ${coupling * 100}%`,
    }))), 
    // Scoped findings
    scopedFindings.length > 0
        ? h("div", { class: "mt-12" }, h("div", { class: "label mb-6" }, `Findings (${scopedFindings.length})`), scopedFindings.slice(0, 5).map((f, i) => h("div", { key: i, class: "detail-finding-item" }, f.text)), scopedFindings.length > 5
            ? h("div", { class: "detail-more" }, `... and ${scopedFindings.length - 5} more`)
            : null)
        : null, 
    // Navigation buttons
    navigateTo
        ? h("div", { class: "detail-nav-group" }, h("button", {
            class: "detail-nav-btn",
            onClick: () => navigateTo("files", { zone: zoneId }),
        }, "\u2630 View in Files"), h("button", {
            class: "detail-nav-btn",
            onClick: () => navigateTo("problems"),
        }, "\u26A0 View Problems"), h("button", {
            class: "detail-nav-btn",
            onClick: () => navigateTo("suggestions"),
        }, "\u2728 View Suggestions"))
        : null);
}
function renderGenericDetail(detail) {
    const entries = Object.entries(detail).filter(([k, v]) => k !== "type" && v !== undefined && v !== null);
    return h(Fragment, null, entries.map(([key, value]) => {
        if (key === "title")
            return null;
        const displayValue = Array.isArray(value)
            ? value.length > 5
                ? `${value.slice(0, 5).join(", ")}... (${value.length} total)`
                : value.join(", ")
            : typeof value === "object"
                ? JSON.stringify(value)
                : String(value);
        return h("div", { key, class: "detail-row" }, h("span", { class: "label" }, formatKey(key)), h("span", null, displayValue));
    }));
}
function formatKey(key) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}
//# sourceMappingURL=detail-panel.js.map
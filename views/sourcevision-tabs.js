import { ENRICHMENT_THRESHOLDS } from "./enrichment-thresholds.js";
export const SOURCEVISION_TABS = [
    { id: "overview", icon: "\u25A3", label: "Overview", minPass: 0 },
    { id: "graph", icon: "\u2B95", label: "Import Graph", minPass: 0, featureGate: "sourcevision.callGraph" },
    { id: "zones", icon: "\u2B22", label: "Zones", minPass: 0 },
    { id: "files", icon: "\u2630", label: "Files", minPass: 0 },
    { id: "routes", icon: "\u25C7", label: "Routes", minPass: 0 },
    { id: "architecture", icon: "\u25E8", label: "Architecture", minPass: ENRICHMENT_THRESHOLDS.architecture },
    { id: "problems", icon: "\u26A0", label: "Problems", minPass: ENRICHMENT_THRESHOLDS.problems },
    { id: "suggestions", icon: "\u2728", label: "Suggestions", minPass: ENRICHMENT_THRESHOLDS.suggestions },
    { id: "pr-markdown", icon: "\u270D", label: "PR Markdown", minPass: 0 },
];
export const SOURCEVISION_TAB_IDS = SOURCEVISION_TABS.map((tab) => tab.id);
//# sourceMappingURL=sourcevision-tabs.js.map
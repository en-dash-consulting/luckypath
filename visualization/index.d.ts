/**
 * Unified visualization abstraction layer.
 *
 * This barrel consolidates all visualization primitives — color system, metric
 * helpers, flow-diagram data builders, and reusable chart/gauge components —
 * into a single import target.
 *
 * Before this module existed, visualization concerns were fragmented across
 * five+ SourceVision zones:
 *   - dashboard-visualization   (health-gauge, zone-map, overview)
 *   - chart-visualization-layer (mini-charts, problems)
 *   - data-visualization        (findings-list, collapsible-section, tree-view)
 *   - graph-visualization-engine(physics, renderer)
 *   - interactive-data-visualization (graph view, file explorer)
 *
 * Consumer views now import from `../visualization/index.js` (or individual
 * sub-modules) instead of reaching across those zone boundaries.
 *
 * Hierarchy (foundation → primitives → compositions):
 *   colors.ts    — zone palette, color lookup, color-map builder
 *   metrics.ts   — meterClass for 0–1 metric classification
 *   flow.ts      — edge/node builders for flow diagrams
 *   components   — BarChart, FlowDiagram, HealthGauge, ZoneMap, etc.
 */
export { ZONE_COLORS, getZoneColorByIndex, getZoneColor, buildZoneColorMap, } from "./colors.js";
export { meterClass } from "./metrics.js";
export { buildFileToZoneMap, buildFlowEdges, buildCallFlowEdges, buildExternalImportEdges, buildFlowNodes, } from "./flow.js";
export { BarChart, FlowDiagram } from "../components/data-display/mini-charts.js";
export { HealthGauge, PatternBadge, MetricCard } from "../components/data-display/health-gauge.js";
export { CollapsibleSection } from "../components/data-display/collapsible-section.js";
export { FindingsList } from "../components/data-display/findings-list.js";
export { TreeView } from "../components/data-display/tree-view.js";
export type { TreeNode } from "../components/data-display/tree-view.js";
export { ZoneMap, ZoneDetail } from "../components/data-display/zone-map.js";

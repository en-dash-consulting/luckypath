/**
 * Flow-diagram data builders — transform zone/call/external-import data
 * into { from, to, weight } edge arrays and { id, label, color } node arrays
 * consumed by FlowDiagram and similar visualization components.
 *
 * Extracted from utils.ts to consolidate all flow-related logic in the
 * visualization layer and reduce the hub status of the old utils module.
 */
import type { Zones, CallEdge, ExternalImport } from "../external.js";
/** Build a map from file path to zone info (id, name, color). */
export declare function buildFileToZoneMap(zones: Zones | null): Map<string, {
    id: string;
    name: string;
    color: string;
}>;
/** Build aggregated flow edges from zone crossings for FlowDiagram. */
export declare function buildFlowEdges(crossings: Zones["crossings"]): Array<{
    from: string;
    to: string;
    weight: number;
}>;
/** Build aggregated flow edges from call graph edges for FlowDiagram. */
export declare function buildCallFlowEdges(edges: CallEdge[], fileToZoneMap: Map<string, {
    id: string;
    name: string;
    color: string;
}>): Array<{
    from: string;
    to: string;
    weight: number;
}>;
/**
 * Build cross-zone edges from external package imports.
 *
 * Static call analysis can't resolve cross-package function calls — they appear
 * as external imports (e.g. `import { ... } from "rex"`). This function maps
 * those external package names back to zones and creates weighted edges so the
 * call graph diagram shows inter-package traffic.
 */
export declare function buildExternalImportEdges(external: ExternalImport[], fileToZoneMap: Map<string, {
    id: string;
    name: string;
    color: string;
}>, zones: Zones): Array<{
    from: string;
    to: string;
    weight: number;
}>;
/** Build flow nodes for FlowDiagram from zones. */
export declare function buildFlowNodes(zones: Zones): Array<{
    id: string;
    label: string;
    color: string;
}>;

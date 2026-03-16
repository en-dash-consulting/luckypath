/**
 * useSubZoneEdges — Compute subzone-level edges for the zone diagram.
 *
 * When a zone with subzones is expanded inline, this hook produces:
 * 1. Internal subCrossing edges (dashed arcs between subzone rows)
 * 2. External-to-subzone edges (from external zone boxes to specific subzone rows)
 */
import type { ZoneData, FlowEdge, BoxRect, FileConnectionMap, ExpandedSubZones } from "../views/zone-types.js";
interface SubZoneEdgeElement {
    key: string;
    d: string;
    color: string;
    weight: number;
    dashed?: boolean;
}
export interface SubZoneEdgesResult {
    subZoneEdgeElements: SubZoneEdgeElement[];
    hiddenZoneEdges: Set<string>;
}
export declare function useSubZoneEdges(edges: FlowEdge[], boxes: Map<string, BoxRect>, expandedZones: Set<string>, expandedSubZones: ExpandedSubZones, zoneById: Map<string, ZoneData>, fileConnections: FileConnectionMap): SubZoneEdgesResult;
export {};

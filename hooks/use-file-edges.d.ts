/**
 * useFileEdges — Compute file-level cross-zone edges for the zone diagram.
 *
 * When zone boxes are expanded, this hook computes the SVG paths connecting
 * individual files across zones, replacing the coarser zone-to-zone edges.
 */
import type { FileConnectionMap, FileToFileMap, ZoneData, FlowEdge, BoxRect } from "../views/zone-types.js";
interface FileEdgeElement {
    key: string;
    d: string;
    color: string;
    weight: number;
}
export interface FileEdgesResult {
    fileEdgeElements: FileEdgeElement[];
    hiddenZoneEdges: Set<string>;
}
/**
 * Compute file-level edges for expanded zones and determine which zone-level
 * edges should be hidden (replaced by file-level detail).
 */
export declare function useFileEdges(edges: FlowEdge[], boxes: Map<string, BoxRect>, expandedZones: Set<string>, zoneById: Map<string, ZoneData>, fileConnections: FileConnectionMap, fileToFileMap: FileToFileMap): FileEdgesResult;
export {};

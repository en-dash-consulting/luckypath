/**
 * GraphRenderer — imperative SVG rendering for the force-directed import graph.
 *
 * Extracted from viewer/views/graph.ts. Owns all DOM manipulation, event
 * handlers, LOD, and physics integration. Uses AbortController for clean
 * teardown of all event listeners.
 *
 * @remarks Class methods (highlightNode, centerOnNode, selectNode, etc.) are
 * exported as part of the GraphRenderer class. Static analysis may flag these
 * as unused because they are called via class instances, not via static imports.
 */
export interface GraphNode {
    id: string;
    zone?: string;
    zoneColor?: string;
    importCount: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
}
export interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    crossZone: boolean;
}
/** Minimal zone info the renderer needs for grouping. */
export interface ZoneInfo {
    id: string;
    name: string;
    color: string;
    files: string[];
}
export interface GraphRendererOptions {
    svg: SVGSVGElement;
    nodes: GraphNode[];
    links: GraphLink[];
    width: number;
    height: number;
    onNodeSelect: (detail: {
        title: string;
        path: string;
        zone: string;
        incomingImports: number;
    }) => void;
    onNodeDblClick?: (path: string) => void;
    onZoneSelect?: (zoneId: string) => void;
    zoneInfos: ZoneInfo[];
}
export declare class GraphRenderer {
    readonly nodes: GraphNode[];
    readonly nodeGroups: SVGGElement[];
    private readonly svg;
    private readonly g;
    private readonly linkElements;
    private readonly nodeRadii;
    private readonly resolvedLinks;
    private readonly nodeEdgeMap;
    private readonly ac;
    private readonly sim;
    private readonly width;
    private readonly height;
    private viewX;
    private viewY;
    private viewW;
    private viewH;
    private scale;
    private destroyed;
    private selectedNodeId;
    private wasPanning;
    private labelsHidden;
    private labelRects;
    private tooltip;
    private readonly zoneInfos;
    private readonly zoneHullGroup;
    private readonly zoneHullElements;
    private readonly zoneLabelElements;
    private readonly collapsedZones;
    private readonly zoneNodeIndices;
    private zonesVisible;
    private readonly onZoneSelect?;
    private readonly zoneLabelLayer;
    constructor(opts: GraphRendererOptions);
    highlightNode(id: string | null): void;
    centerOnNode(id: string): void;
    /** Select a node and apply persistent highlighting to its connections. */
    selectNode(id: string | null): void;
    /** Clear the current persistent selection. */
    clearSelection(): void;
    /** Toggle label visibility on/off. Returns the new state. */
    toggleLabels(): boolean;
    /** Get current label visibility state. */
    get labelsVisible(): boolean;
    /** Toggle zone hull visibility on/off. Returns the new state. */
    toggleZones(): boolean;
    /** Get current zone visibility state. */
    get zonesGroupsVisible(): boolean;
    /** Collapse a zone group — hides member nodes/edges and shows a summary node. */
    collapseZone(zoneId: string): void;
    /** Expand a previously collapsed zone group. */
    expandZone(zoneId: string): void;
    /** Toggle a zone between collapsed and expanded. Returns true if now collapsed. */
    toggleZoneCollapse(zoneId: string): boolean;
    /** Check if a zone is currently collapsed. */
    isZoneCollapsed(zoneId: string): boolean;
    /** Zoom in by the given factor (default 1.25 = 25% closer). Zooms toward center. */
    zoomIn(factor?: number): void;
    /** Zoom out by the given factor (default 1.25 = 25% further). Zooms from center. */
    zoomOut(factor?: number): void;
    /** Reset the viewport to fit all content. */
    resetView(): void;
    destroy(): void;
    /** Create SVG <defs> with the arrowhead marker. */
    private createSvgDefs;
    /** Build the zone → node-index map used for hull rendering and collapse. */
    private buildZoneNodeMap;
    /** Create an SVG <g> layer, append it to the root group, and return it. */
    private createSvgLayer;
    /** Resolve string-based link endpoints to GraphNode references. */
    private resolveGraphLinks;
    /** Build a node-id → edge-index adjacency map for hover/select highlighting. */
    private buildAdjacencyMap;
    /** Create SVG line elements for all resolved links. */
    private createLinkElements;
    /** Create SVG groups for all nodes (hit target, circle, label). */
    private createNodeElements;
    /** Pre-allocate label rect objects reused each frame to avoid GC pressure. */
    private allocateLabelRects;
    /** Create the shared tooltip SVG group (hidden by default). */
    private createTooltipElement;
    private applySelectionHighlight;
    /** Create SVG elements for each zone hull (background + label). */
    private createZoneHulls;
    /** Update hull paths and labels to match current node positions. */
    private updateZoneHulls;
    /** Get approximate radius of a zone cluster for label positioning. */
    private getZoneRadius;
    /** Hide member nodes/edges when a zone is collapsed, show summary. */
    private applyZoneCollapse;
    /** Show member nodes/edges when a zone is expanded. */
    private applyZoneExpand;
    private updateViewBox;
    private fitToContent;
    /**
     * Update level-of-detail: circle sizing, label visibility, and overlap hiding.
     *
     * Strategy:
     *  1. Zoom-based LOD: hide labels when nodes are too small to read.
     *  2. Density-aware priority: in crowded areas, only show labels for high-import
     *     nodes (they are the most useful landmarks).
     *  3. Greedy overlap removal: iterate nodes by importance (import count desc),
     *     place labels greedily, hide labels that would overlap already-placed ones.
     *  4. User toggle: labelsHidden overrides everything.
     */
    private updateLOD;
    /** Cached sort order — recomputed only when node count changes. */
    private _sortedOrder;
    private _sortedOrderLen;
    /** Get indices sorted by import count (descending). Cached per node-count. */
    private getSortedLabelOrder;
    private updateDOM;
    private tickCallbacks;
    private startSimulation;
    /** Re-heat the simulation to adapt to moved nodes. */
    private reheat;
    /** Convert client (screen) coordinates to SVG viewBox coordinates. */
    private clientToViewBox;
    /** Find the node index under a given SVG element by walking up the DOM tree. */
    private findNodeIndex;
    /** Apply a zoom factor centered on the current viewport center. */
    private applyZoomFromCenter;
    private setupZoom;
    private setupPanAndDrag;
    private setupTouchInteraction;
    /**
     * Show full filename tooltip on node hover. The tooltip is a single shared
     * SVG group that follows the hovered node. This avoids per-node <title>
     * elements (which have inconsistent browser rendering and delays).
     */
    private setupLabelTooltips;
    private setupHoverHighlighting;
}

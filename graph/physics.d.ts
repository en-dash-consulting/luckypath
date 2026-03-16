/**
 * Physics engine for the force-directed graph layout.
 *
 * Barnes-Hut quad-tree for O(n log n) repulsion,
 * link attraction, center gravity, and velocity integration.
 *
 * Extracted from viewer/views/graph.ts — pure refactor, no behavioural changes.
 */
export interface PhysicsNode {
    id: string;
    zone?: string;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
}
export interface PhysicsLink {
    source: PhysicsNode;
    target: PhysicsNode;
    crossZone?: boolean;
}
/** Barnes-Hut quad-tree node. */
export interface QTNode {
    cx: number;
    cy: number;
    mass: number;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    children: (QTNode | null)[] | null;
    nodeIdx: number;
}
export interface SimState {
    nodes: PhysicsNode[];
    resolvedLinks: PhysicsLink[];
    width: number;
    height: number;
    alpha: {
        value: number;
    };
    frameCount: number;
    hasFitted: boolean;
    /** Current scale factor (viewW / width). */
    scale: number;
    nodeRadii: number[];
    /** Zone centroid positions, updated each frame for zone-clustering force. */
    zoneCentroids?: Map<string, {
        x: number;
        y: number;
        count: number;
    }>;
}
export declare function computeForceParams(nodeCount: number): {
    alphaDecay: number;
    velocityDecay: number;
    repulsionStrength: number;
    centerGravityStrength: number;
    linkRestLength: number;
    useBH: boolean;
    bhTheta: number;
    crossZoneLinkMultiplier: number;
    zoneCohesionStrength: number;
    zoneRepulsionStrength: number;
};
export declare function hashPosition(id: string): number;
export declare function initZoneClusteredPositions(nodes: PhysicsNode[], width: number, height: number): void;
/** Compute the average (centroid) position of nodes in each zone. */
export declare function computeZoneCentroids(nodes: PhysicsNode[]): Map<string, {
    x: number;
    y: number;
    count: number;
}>;
/**
 * Push zone centroids apart so groups maintain clear spatial separation.
 * Each zone centroid repels every other via inverse-square force, propagated
 * equally to all zone members.
 */
export declare function applyZoneCentroidRepulsion(nodes: PhysicsNode[], centroids: Map<string, {
    x: number;
    y: number;
    count: number;
}>, strength: number, alpha: number): void;
export declare function buildQuadTree(nodes: PhysicsNode[], nodeCount: number): QTNode | null;
export declare function bhRepulsion(qt: QTNode | null, idx: number, nx: number, ny: number, a: number, nodes: PhysicsNode[], repulsionStrength: number, bhTheta: number): void;
/**
 * Callbacks the renderer supplies so the tick can update the DOM and viewBox.
 */
export interface TickCallbacks {
    updateDOM: (sim: SimState) => void;
    fitToContent: () => void;
    scheduleNextTick: (fn: () => void) => void;
}
export declare function tick(sim: SimState, callbacks: TickCallbacks): void;

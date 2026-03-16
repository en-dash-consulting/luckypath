/**
 * Graph zone public interface.
 *
 * All cross-zone consumers should import from this barrel rather than
 * individual implementation files. Type-only imports are excluded per
 * the gateway pattern (erased at compile time, stay at call-site).
 */
// ── Physics engine ───────────────────────────────────────────────────────────
export { computeForceParams, hashPosition, initZoneClusteredPositions, computeZoneCentroids, applyZoneCentroidRepulsion, buildQuadTree, bhRepulsion, tick, } from "./physics.js";
// ── Graph renderer ───────────────────────────────────────────────────────────
export { GraphRenderer, } from "./renderer.js";
//# sourceMappingURL=index.js.map
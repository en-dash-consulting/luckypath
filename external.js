/**
 * External gateway for the viewer layer.
 *
 * All viewer-side imports from outside `src/viewer/` are funnelled through
 * this single file. This creates an explicit, auditable import boundary
 * that keeps zone-crossing edges to one file instead of scattering them
 * across the viewer tree.
 *
 * Pattern reference: CLAUDE.md § Gateway modules
 */
// Namespace re-export for validate.ts (import type * as V1)
export * as V1 from "../schema/v1.js";
// ── Shared data-file constants ─────────────────────────────────────────────
export { DATA_FILES, ALL_DATA_FILES, SUPPLEMENTARY_FILES } from "../shared/data-files.js";
// ── Shared utilities ───────────────────────────────────────────────────────
export { createRequestDedup } from "./messaging/request-dedup.js";
//# sourceMappingURL=external.js.map
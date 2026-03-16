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
export type { Manifest, Inventory, Imports, Zones, Components, CallGraph, CallEdge, ComponentUsageEdge, ExternalImport, FileEntry, Finding, RouteExportKind, RouteTreeNode, Zone, ZoneCrossing, } from "../schema/v1.js";
export * as V1 from "../schema/v1.js";
export type { FeatureToggle, FeaturesResponse } from "../schema/features.js";
export { DATA_FILES, ALL_DATA_FILES, SUPPLEMENTARY_FILES } from "../shared/data-files.js";
export type { ViewId } from "../shared/view-id.js";
export { createRequestDedup } from "./messaging/request-dedup.js";
export type { RequestDedup } from "./messaging/request-dedup.js";

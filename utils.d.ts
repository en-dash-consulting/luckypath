/**
 * Shared viewer utilities — path display helpers.
 *
 * Color, metric, and flow-diagram utilities have been extracted to the
 * `visualization/` layer (colors.ts, metrics.ts, flow.ts) to reduce this
 * module's hub status and consolidate visualization concerns.
 *
 * Re-exports are provided below for backward compatibility so existing
 * consumers don't break.  New code should import from `visualization/`
 * directly.
 */
/** Extract the filename from a path (last segment after '/'). */
export declare function basename(path: string): string;
/**
 * Truncate a filename for graph labels, preserving extension and meaningful prefix.
 * Returns a shortened name with ellipsis when the name exceeds maxLen characters.
 *
 * Examples:
 *   truncateFilename("very-long-component-name.tsx", 16) → "very-long…e.tsx"
 *   truncateFilename("short.ts", 16) → "short.ts"
 */
export declare function truncateFilename(name: string, maxLen?: number): string;
export { getZoneColorByIndex, getZoneColor, buildZoneColorMap, } from "./visualization/colors.js";
export { meterClass } from "./visualization/metrics.js";
export { buildFileToZoneMap, buildFlowEdges, buildCallFlowEdges, buildExternalImportEdges, buildFlowNodes, } from "./visualization/flow.js";

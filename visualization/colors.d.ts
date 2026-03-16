/**
 * Zone color system — the single source of truth for all zone-related colors.
 *
 * Previously scattered across components/constants.ts (palette) and utils.ts
 * (lookup helpers). Consolidated here so every visualization zone imports from
 * one module instead of reaching into unrelated directories.
 */
import type { Zones } from "../external.js";
/** Design-token palette for zone rendering.  Wraps at length. */
export declare const ZONE_COLORS: string[];
/** Get the zone color by array index (wraps around). */
export declare function getZoneColorByIndex(index: number): string;
/** Get the display color for a zone by its index in the zones array. */
export declare function getZoneColor(zones: Zones, zoneId: string): string;
/** Build a map from zone id to its display color. */
export declare function buildZoneColorMap(zones: Zones | null): Map<string, string>;

import type { ViewId } from "./types.js";
export interface ParsedRoute {
    view: ViewId;
    subId: string | null;
}
export declare function parsePathnameRoute(pathname: string, validViews: Set<ViewId>): ParsedRoute | null;
export declare function parseLegacyHashRoute(hash: string, validViews: Set<ViewId>): ParsedRoute | null;
export declare function resolveLocationRoute(pathname: string, hash: string, validViews: Set<ViewId>): ParsedRoute | null;

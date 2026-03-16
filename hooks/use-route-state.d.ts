/**
 * Route state management hook for the viewer app.
 *
 * Manages the active view, selected entity IDs (file, zone, run, task),
 * URL history synchronisation, and backward-compat migration of legacy hash URLs.
 */
import type { ViewId, NavigateTo } from "../types.js";
export interface RouteState {
    view: ViewId;
    selectedFile: string | null;
    setSelectedFile: (file: string | null) => void;
    selectedZone: string | null;
    selectedRunId: string | null;
    selectedTaskId: string | null;
    navigateTo: NavigateTo;
    handleSidebarNav: (id: ViewId) => void;
}
export declare function useRouteState(validViews: Set<ViewId>): RouteState;

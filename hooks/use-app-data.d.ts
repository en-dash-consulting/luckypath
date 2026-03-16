/**
 * App data management hook for the viewer.
 *
 * Handles mode detection (server vs static file drop), data loading,
 * polling, drag-and-drop file loading, and the refresh toast notification.
 *
 * Memory-efficient loading strategy:
 * 1. Load manifest + zones first (small, needed for sidebar/shell)
 * 2. Load remaining modules in the background without blocking the UI
 * 3. Polling uses selective refresh — only reloads files whose mtime changed
 *
 * Polling is automatically suspended when memory pressure disables the
 * `autoRefresh` feature (elevated tier, ≥50% heap usage). The hook
 * subscribes to degradation changes internally so the suspension is
 * self-contained — callers do not need to pass `pausePolling` for
 * memory-pressure protection.
 */
import type { LoadedData } from "../types.js";
export interface AppDataState {
    data: LoadedData;
    loading: boolean;
    mode: "server" | "static";
    refreshToast: boolean;
    showDrop: boolean;
    setLoading: (loading: boolean) => void;
}
export interface UseAppDataOptions {
    /** When true, data polling is paused to conserve memory (graceful degradation). */
    pausePolling?: boolean;
}
export declare function useAppData(options?: UseAppDataOptions): AppDataState;

/**
 * Hook for project-wide status polling + WebSocket instant updates.
 *
 * Fetches `/api/status` with dedup + visibility-aware polling, and listens
 * for WebSocket events (hench:run-changed, rex:prd-changed) to refresh
 * immediately when backend state changes.
 *
 * Polling is automatically suspended when memory pressure disables the
 * `autoRefresh` feature (elevated tier and above). The last-known status
 * is preserved and displayed without updates until pressure subsides.
 *
 * Follows the same hook-over-infrastructure pattern as use-prd-websocket,
 * use-memory-monitor, etc. — all infrastructure coupling (WebSocket,
 * ws-pipeline, graceful-degradation) lives here rather than in a
 * presentation component.
 */
type AnalysisFreshness = "fresh" | "stale" | "unavailable";
export interface SourceVisionStatus {
    freshness: AnalysisFreshness;
    analyzedAt: string | null;
    minutesAgo: number | null;
    modulesComplete: number;
    modulesTotal: number;
}
export interface TreeStats {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    deferred: number;
    blocked: number;
}
export interface RexStatus {
    exists: boolean;
    percentComplete: number;
    stats: TreeStats | null;
    hasInProgress: boolean;
    hasPending: boolean;
    nextTaskTitle: string | null;
}
export interface HenchStatus {
    configured: boolean;
    totalRuns: number;
    activeRuns: number;
    staleRuns: number;
}
export interface ProjectStatus {
    sv: SourceVisionStatus;
    rex: RexStatus;
    hench: HenchStatus;
}
/** Hook that returns project status, polling at a regular interval.
 *  Also listens for WebSocket events (hench:run-changed, rex:prd-changed)
 *  to refresh immediately when runs or PRD data change on disk.
 *
 *  Polling is automatically suspended when memory pressure disables the
 *  `autoRefresh` feature (elevated tier and above). The last-known status
 *  is preserved and displayed without updates until pressure subsides. */
export declare function useProjectStatus(): ProjectStatus | null;
export {};

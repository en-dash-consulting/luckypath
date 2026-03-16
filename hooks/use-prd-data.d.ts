/**
 * PRD data fetching hook with structural sharing, dedup, and rate limiting.
 *
 * Encapsulates all PRD + task-usage data fetching logic extracted from
 * PRDView. Manages:
 *
 * - PRD document state (data, loading, error)
 * - Task usage and weekly budget state
 * - Request deduplication (concurrent callers share one in-flight request)
 * - Rate limiting (max 2 requests/sec per endpoint)
 * - Structural sharing via diffDocument (unchanged items keep references)
 * - Visibility-aware polling for task usage
 * - Cleanup of rate limiter timers on unmount
 *
 * @see ../components/prd-tree/tree-differ.ts — structural sharing implementation
 * @see ../messaging/fetch-pipeline.ts — composed dedup + rate limiting
 */
import type { PRDDocumentData } from "../components/prd-tree/types.js";
import type { TaskUsageSummary, WeeklyBudgetResolution } from "../components/prd-tree/types.js";
export interface PRDDataState {
    /** Current PRD document, or null if not yet loaded. */
    data: PRDDocumentData | null;
    /** Setter for optimistic updates from WebSocket/actions. */
    setData: (updater: PRDDocumentData | null | ((prev: PRDDocumentData | null) => PRDDocumentData | null)) => void;
    /** True while the initial fetch is in flight. */
    loading: boolean;
    /** Error message, or null. */
    error: string | null;
    /** Setter for error state (used by WebSocket pipeline). */
    setError: (error: string | null) => void;
    /** Per-task usage summaries keyed by task ID. */
    taskUsageById: Record<string, TaskUsageSummary>;
    /** Resolved weekly budget (for utilization calculations). */
    weeklyBudget: WeeklyBudgetResolution | null;
    /** Fetch/reconcile PRD data from server. Rate-limited and deduped. */
    fetchPRDData: () => Promise<void>;
    /** Fetch/reconcile task usage data from server. Rate-limited and deduped. */
    fetchTaskUsage: () => Promise<void>;
}
/**
 * Hook managing all PRD data loading, polling, and state.
 *
 * @param prdData - Optional pre-loaded PRD data (skips initial fetch).
 */
export declare function usePRDData(prdData?: PRDDocumentData | null): PRDDataState;

import type { TaskUtilizationSummary, WeeklyBudgetResolution } from "./types.js";
export declare const MISSING_BUDGET_LABEL = "No budget";
/**
 * Compute deterministic task-level utilization from usage + resolved weekly budget.
 * Both task chips and task detail rows should consume this shared output.
 */
export declare function resolveTaskUtilization(totalTokens: number, weeklyBudget?: WeeklyBudgetResolution | null): TaskUtilizationSummary;

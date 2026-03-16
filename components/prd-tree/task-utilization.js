export const MISSING_BUDGET_LABEL = "No budget";
function fallbackReason(weeklyBudget) {
    return weeklyBudget?.source ?? "missing_budget";
}
/**
 * Compute deterministic task-level utilization from usage + resolved weekly budget.
 * Both task chips and task detail rows should consume this shared output.
 */
export function resolveTaskUtilization(totalTokens, weeklyBudget) {
    const budget = weeklyBudget?.budget;
    if (typeof budget !== "number" || !Number.isFinite(budget) || budget <= 0) {
        return {
            percent: null,
            label: MISSING_BUDGET_LABEL,
            reason: fallbackReason(weeklyBudget),
        };
    }
    const percent = Math.round((totalTokens / budget) * 100);
    return {
        percent,
        label: `${percent}%`,
        reason: fallbackReason(weeklyBudget),
    };
}
//# sourceMappingURL=task-utilization.js.map
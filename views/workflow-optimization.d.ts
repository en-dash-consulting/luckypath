/**
 * Workflow Optimization view — displays analysis of run history with
 * actionable suggestions that users can preview, accept, reject, or defer.
 *
 * Data comes from:
 *   GET  /api/hench/workflow/analysis   (full analysis + suggestions)
 *   POST /api/hench/workflow/apply      (apply config changes, with preview)
 *   POST /api/hench/workflow/suggestions/:id (record decision)
 */
export declare function WorkflowOptimizationView(): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;

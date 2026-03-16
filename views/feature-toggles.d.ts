/**
 * Feature Toggles view — manage experimental and stable feature flags.
 *
 * Displays feature flags organized by package (sourcevision, rex, hench)
 * with toggle controls. Changes are saved immediately on toggle and
 * reflected without server restart.
 *
 * Data comes from GET /api/features (read) and
 * PUT /api/features (update).
 */
export declare function FeatureTogglesView(): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;

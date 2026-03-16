/**
 * Hench Templates view — browse, apply, and manage workflow templates.
 *
 * Displays a gallery of built-in and user-defined templates with metadata,
 * use cases, and config overrides. Users can apply templates to their
 * current configuration or save their current config as a new template.
 *
 * Data comes from:
 *   GET  /api/hench/templates          (list)
 *   GET  /api/hench/templates/:id      (detail)
 *   POST /api/hench/templates/:id/apply (apply)
 *   POST /api/hench/templates          (create)
 *   DELETE /api/hench/templates/:id    (delete)
 */
export declare function HenchTemplatesView(): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;

/**
 * Notion database schema validation wizard.
 *
 * An interactive component that validates the target Notion database schema
 * against the expected PRD property structure, shows per-property diagnostics,
 * and offers to auto-create missing properties where the Notion API allows it.
 *
 * Data comes from:
 *   POST /api/notion/schema      — validate database schema
 *   POST /api/notion/schema/fix   — create missing properties
 */
export declare function NotionSchemaWizard({ isConfigured }: {
    isConfigured: boolean;
}): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;

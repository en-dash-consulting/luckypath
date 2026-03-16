/**
 * Notion Configuration view — manages Notion API credentials and connection.
 *
 * Provides a secure form for entering Notion API key and database ID,
 * validates input format, tests the connection, and displays connection
 * health status with a green/yellow/red indicator.
 *
 * Data comes from:
 *   GET    /api/notion/config  — current config (masked token)
 *   PUT    /api/notion/config  — save credentials
 *   POST   /api/notion/test    — test connection
 *   DELETE /api/notion/config  — remove config
 */
export declare function NotionConfigView(): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;

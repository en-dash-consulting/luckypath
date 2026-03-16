/**
 * Global FAQ button — lives in the sidebar footer toolbar (bottom-left).
 * Opens the full FAQ modal without view-contextual auto-expansion.
 */
export declare function GlobalFAQ(): import("preact").VNode<import("preact").Attributes>;
/**
 * Header FAQ button — contextual entry point in the content area header.
 * Auto-expands the FAQ section relevant to the current view.
 */
export declare function HeaderFAQ({ view }: {
    view: string;
}): import("preact").VNode<import("preact").Attributes>;

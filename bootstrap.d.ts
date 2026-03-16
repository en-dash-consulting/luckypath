/**
 * Application bootstrap — module-level side effects.
 *
 * Initializes theme, tab-visibility monitoring, polling infrastructure,
 * and tick-visibility gating.  Called once at application startup before
 * the first render.
 *
 * In deployed (static export) mode, the fetch adapter is installed first
 * so all subsequent network requests are transparently rewritten to hit
 * pre-rendered JSON files instead of a live server.
 */
/** Run all one-time setup operations. */
export declare function bootstrap(): void;

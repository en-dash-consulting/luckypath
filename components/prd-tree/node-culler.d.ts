/**
 * Off-screen node culling engine using IntersectionObserver.
 *
 * Manages a single shared IntersectionObserver that tracks multiple tree
 * node elements and invokes per-element callbacks when visibility changes.
 * Nodes outside the viewport buffer are "culled" — their DOM children are
 * removed and replaced with a height-preserving placeholder, freeing memory
 * and preventing event listener accumulation.
 *
 * When culled nodes scroll back into view, the callback fires again and the
 * component re-renders the full node content. The observer stores the last
 * known height so placeholders can preserve scroll position.
 *
 * Designed as a standalone module with zero framework dependencies —
 * Preact integration is handled in the CulledNode component (prd-tree.ts).
 *
 * @see ./prd-tree.ts — CulledNode component that wraps each tree node
 */
/** Configuration for creating a NodeCuller instance. */
export interface NodeCullerOptions {
    /** Buffer zone in pixels above/below viewport before culling (default: 200). */
    bufferPx?: number;
    /** Root element for IntersectionObserver (default: null = viewport). */
    root?: Element | null;
}
/** Read-only diagnostic snapshot of culler state. */
export interface NodeCullerState {
    /** Number of elements currently being observed. */
    trackedCount: number;
    /** Whether the culler has been disposed. */
    disposed: boolean;
}
/** Callback invoked when an element's visibility changes. */
export type VisibilityCallback = (isVisible: boolean) => void;
/**
 * Shared IntersectionObserver-based node culler.
 *
 * Creates a single observer that efficiently tracks many elements.
 * Each element gets a per-element callback that fires when its
 * visibility (within the buffer zone) changes.
 *
 * Usage:
 * ```ts
 * const culler = new NodeCuller({ bufferPx: 200 });
 *
 * // Start observing an element
 * const cleanup = culler.observe(element, (isVisible) => {
 *   if (isVisible) renderFullContent();
 *   else renderPlaceholder(culler.getLastHeight(element));
 * });
 *
 * // Stop observing
 * cleanup();
 *
 * // Tear down the entire culler
 * culler.dispose();
 * ```
 */
export declare class NodeCuller {
    private observer;
    private callbacks;
    private heights;
    private _disposed;
    constructor(options?: NodeCullerOptions);
    /**
     * Start observing an element for visibility changes.
     *
     * The callback fires immediately when the observer first evaluates the
     * element (typically within one frame) and again whenever it crosses
     * the viewport buffer boundary.
     *
     * Returns a cleanup function that unobserves the element, removes
     * the callback, and clears stored height data. Call this in your
     * component's cleanup/unmount handler.
     */
    observe(element: Element, callback: VisibilityCallback): () => void;
    /**
     * Get the last known height of an observed element.
     *
     * Recorded from IntersectionObserverEntry.boundingClientRect when
     * the element transitions to off-screen. Returns 0 if no height
     * has been recorded yet.
     */
    getLastHeight(element: Element): number;
    /**
     * Dispose the observer and clear all tracked state.
     *
     * After disposal, observe() becomes a no-op. Safe to call multiple times.
     */
    dispose(): void;
    /** Whether this culler has been disposed. */
    get disposed(): boolean;
    /** Get a diagnostic snapshot of current state. */
    getState(): NodeCullerState;
    private handleEntries;
}

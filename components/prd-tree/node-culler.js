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
// ─── Default configuration ───────────────────────────────────────────────────
const DEFAULT_BUFFER_PX = 200;
// ─── NodeCuller ──────────────────────────────────────────────────────────────
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
export class NodeCuller {
    observer;
    callbacks = new Map();
    heights = new Map();
    _disposed = false;
    constructor(options = {}) {
        const bufferPx = options.bufferPx ?? DEFAULT_BUFFER_PX;
        this.observer = new IntersectionObserver((entries) => this.handleEntries(entries), {
            root: options.root ?? null,
            rootMargin: `${bufferPx}px 0px ${bufferPx}px 0px`,
        });
    }
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
    observe(element, callback) {
        if (this._disposed)
            return () => { };
        this.callbacks.set(element, callback);
        this.observer.observe(element);
        return () => {
            this.callbacks.delete(element);
            this.heights.delete(element);
            if (!this._disposed) {
                this.observer.unobserve(element);
            }
        };
    }
    /**
     * Get the last known height of an observed element.
     *
     * Recorded from IntersectionObserverEntry.boundingClientRect when
     * the element transitions to off-screen. Returns 0 if no height
     * has been recorded yet.
     */
    getLastHeight(element) {
        return this.heights.get(element) ?? 0;
    }
    /**
     * Dispose the observer and clear all tracked state.
     *
     * After disposal, observe() becomes a no-op. Safe to call multiple times.
     */
    dispose() {
        if (this._disposed)
            return;
        this._disposed = true;
        this.observer.disconnect();
        this.callbacks.clear();
        this.heights.clear();
    }
    /** Whether this culler has been disposed. */
    get disposed() {
        return this._disposed;
    }
    /** Get a diagnostic snapshot of current state. */
    getState() {
        return {
            trackedCount: this.callbacks.size,
            disposed: this._disposed,
        };
    }
    // ─── Private ─────────────────────────────────────────────────────────────
    handleEntries(entries) {
        for (const entry of entries) {
            const callback = this.callbacks.get(entry.target);
            if (!callback)
                continue;
            // Record height when transitioning to off-screen, so the placeholder
            // can preserve scroll position. Use boundingClientRect which is
            // already computed by the observer (no additional layout cost).
            if (!entry.isIntersecting) {
                const { height } = entry.boundingClientRect;
                if (height > 0) {
                    this.heights.set(entry.target, height);
                }
            }
            callback(entry.isIntersecting);
        }
    }
}
//# sourceMappingURL=node-culler.js.map
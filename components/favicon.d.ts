/**
 * Dynamic favicon management.
 *
 * Uses PNG favicons for each product section and swaps
 * the <link rel="icon"> element when the active view changes.
 * Falls back to the n-dx logo on non-package-specific pages.
 */
import type { ViewId } from "../types.js";
type Product = "sourcevision" | "rex" | "hench";
declare const FAVICON_PNGS: Record<Product | "ndx", string>;
/**
 * Map from ViewId → the product that owns it.
 * Views not in this map default to the n-dx favicon.
 */
declare const VIEW_TO_PRODUCT: Partial<Record<ViewId, Product>>;
/**
 * Update the browser favicon to match the active view's product section.
 *
 * Call this whenever the view changes. It determines the owning product
 * from the ViewId and swaps the favicon accordingly. Non-package views
 * (if any) fall back to the n-dx logo.
 */
export declare function updateFavicon(view: ViewId): void;
/**
 * Reset internal cache. Call between tests to avoid stale references
 * when the DOM is torn down and rebuilt.
 */
export declare function resetFavicon(): void;
/** Exported for testing. */
export { FAVICON_PNGS, VIEW_TO_PRODUCT };

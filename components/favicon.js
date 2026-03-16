/**
 * Dynamic favicon management.
 *
 * Uses PNG favicons for each product section and swaps
 * the <link rel="icon"> element when the active view changes.
 * Falls back to the n-dx logo on non-package-specific pages.
 */
/* ── PNG favicon paths ──
 *
 * Each product has a branded PNG favicon. These are served as static
 * assets by the web server and copied into dist/viewer/ at build time.
 */
const FAVICON_PNGS = {
    /** n-dx — default brand mark */
    ndx: "/n-dx.png",
    /** SourceVision — pixel-art eye icon */
    sourcevision: "/SourceVision-F.png",
    /** Rex — pixel-art dinosaur icon */
    rex: "/Rex-F.png",
    /** Hench — pixel-art wrench icon */
    hench: "/Hench-F.png",
};
/**
 * Map from ViewId → the product that owns it.
 * Views not in this map default to the n-dx favicon.
 */
const VIEW_TO_PRODUCT = {
    overview: "sourcevision",
    graph: "sourcevision",
    zones: "sourcevision",
    files: "sourcevision",
    routes: "sourcevision",
    architecture: "sourcevision",
    problems: "sourcevision",
    suggestions: "sourcevision",
    "pr-markdown": "sourcevision",
    "rex-dashboard": "rex",
    prd: "rex",
    validation: "rex",
    "hench-runs": "hench",
    "hench-audit": "hench",
};
/** Cached reference to the <link rel="icon"> element. */
let faviconLink = null;
function getFaviconLink() {
    if (faviconLink)
        return faviconLink;
    // Look for existing favicon link
    const existing = document.querySelector('link[rel="icon"]');
    if (existing) {
        faviconLink = existing;
        return faviconLink;
    }
    // Create one if missing (shouldn't happen in practice)
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);
    faviconLink = link;
    return faviconLink;
}
/** Track current favicon to avoid redundant DOM updates. */
let currentProduct = null;
/**
 * Update the browser favicon to match the active view's product section.
 *
 * Call this whenever the view changes. It determines the owning product
 * from the ViewId and swaps the favicon accordingly. Non-package views
 * (if any) fall back to the n-dx logo.
 */
export function updateFavicon(view) {
    const product = VIEW_TO_PRODUCT[view] ?? "ndx";
    if (product === currentProduct)
        return;
    currentProduct = product;
    const link = getFaviconLink();
    link.type = "image/png";
    link.href = FAVICON_PNGS[product];
}
/**
 * Reset internal cache. Call between tests to avoid stale references
 * when the DOM is torn down and rebuilt.
 */
export function resetFavicon() {
    faviconLink = null;
    currentProduct = null;
}
/** Exported for testing. */
export { FAVICON_PNGS, VIEW_TO_PRODUCT };
//# sourceMappingURL=favicon.js.map
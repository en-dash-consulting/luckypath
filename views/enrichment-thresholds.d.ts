/**
 * Enrichment pass thresholds for sourcevision views.
 *
 * Defines the minimum enrichment pass required before each view unlocks.
 * This is sourcevision-domain configuration, not a UI infrastructure primitive.
 */
export declare const ENRICHMENT_THRESHOLDS: {
    readonly architecture: 2;
    readonly problems: 3;
    readonly suggestions: 4;
};

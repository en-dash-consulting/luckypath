/**
 * Metric classification helpers for visualization components.
 *
 * Extracted from utils.ts to give visualization zones a focused import
 * target for metric display logic (health gauges, detail panels, etc.).
 */
/** Classify a 0–1 metric value as good/mid/bad for meter display. */
export declare function meterClass(value: number, invert?: boolean): string;

/**
 * SourceVision tab configuration — domain-specific view tab definitions.
 *
 * Defines the tab IDs, labels, icons, and minimum enrichment pass required
 * for each SourceVision view. This is sourcevision domain config, not a
 * generic infrastructure primitive.
 */
import type { ViewId } from "../types.js";
export type SourceVisionTabId = Extract<ViewId, "overview" | "graph" | "zones" | "files" | "routes" | "architecture" | "problems" | "suggestions" | "pr-markdown">;
export interface SourceVisionTab {
    id: SourceVisionTabId;
    icon: string;
    label: string;
    minPass: number;
    featureGate?: string;
}
export declare const SOURCEVISION_TABS: readonly SourceVisionTab[];
export declare const SOURCEVISION_TAB_IDS: SourceVisionTabId[];

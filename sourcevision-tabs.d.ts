import type { ViewId } from "./types.js";
export type SourceVisionTabId = Extract<ViewId, "overview" | "graph" | "zones" | "files" | "routes" | "architecture" | "problems" | "suggestions" | "pr-markdown">;
export interface SourceVisionTab {
    id: SourceVisionTabId;
    icon: string;
    label: string;
    minPass: number;
}
export declare const SOURCEVISION_TABS: readonly SourceVisionTab[];
export declare const SOURCEVISION_TAB_IDS: SourceVisionTabId[];

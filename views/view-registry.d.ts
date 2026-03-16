/**
 * View registry — maps ViewId to render functions.
 *
 * Centralizes all view component imports and the view-to-component
 * dispatch logic. main.ts imports only `renderActiveView` and
 * `buildValidViews` from here instead of 22 individual view modules.
 */
import type { ComponentChild, VNode } from "preact";
import type { ViewId, NavigateTo, DetailItem, LoadedData } from "../types.js";
import type { DegradableFeature } from "../performance/index.js";
/** Props available to any view render function. */
export interface ViewRenderContext {
    data: LoadedData;
    setDetail: (item: DetailItem | null) => void;
    setPrdDetailContent: (content: VNode<any> | null) => void;
    selectedFile: string | null;
    setSelectedFile: (f: string | null) => void;
    selectedZone: string | null;
    selectedRunId: string | null;
    selectedTaskId: string | null;
    navigateTo: NavigateTo;
    isFeatureDisabled: (feature: DegradableFeature) => boolean;
}
/** Render the view identified by `view` using props from `ctx`. */
export declare function renderActiveView(view: ViewId, ctx: ViewRenderContext): ComponentChild;
/** Build the valid view set based on an optional scope. */
export declare function buildValidViews(scope: string | null): Set<ViewId>;

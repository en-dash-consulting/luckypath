/**
 * Validation & Dependency Graph view.
 *
 * Provides a "Validate" button to run rex validate from the web UI and
 * displays results inline. Renders blockedBy relationships as a visual
 * dependency graph showing blocking chains and circular dependencies.
 */
import type { NavigateTo } from "../types.js";
export declare function ValidationView({ navigateTo }: {
    navigateTo?: NavigateTo;
}): import("preact").VNode<import("preact").Attributes>;

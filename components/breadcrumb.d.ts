/**
 * Breadcrumb navigation component.
 *
 * Displays a "project > tool > view" hierarchy in the page header area.
 * Fetches project metadata from the `/api/project` endpoint and combines
 * it with the current view to build a contextual breadcrumb trail.
 *
 * Also manages `document.title` to reflect the current project and view,
 * formatted as "ProjectName | n-dx" (or "ViewLabel — ProductLabel | ProjectName | n-dx").
 */
import type { ViewId, NavigateTo } from "../types.js";
export interface BreadcrumbProps {
    view: ViewId;
    navigateTo: NavigateTo;
    /** When set, restricts navigation to a single product scope. */
    scope?: string | null;
}
export declare function Breadcrumb({ view, navigateTo, scope }: BreadcrumbProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    "aria-label": string;
}>;

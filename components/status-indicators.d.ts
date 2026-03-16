/**
 * Sidebar status indicators — compact health badges for each product section.
 *
 * Pure presentation components that render status data as sidebar badges.
 * The infrastructure coupling (polling, WebSocket, messaging) lives in the
 * `use-project-status` hook, following the consistent hook abstraction
 * pattern used across all infrastructure services.
 */
import type { ViewId } from "../types.js";
export { useProjectStatus } from "../hooks/index.js";
export type { ProjectStatus, SourceVisionStatus, RexStatus, HenchStatus, } from "../hooks/index.js";
import type { SourceVisionStatus, RexStatus, HenchStatus } from "../hooks/index.js";
interface SvIndicatorProps {
    status: SourceVisionStatus;
    onNavigate: (view: ViewId) => void;
    tabIndex: number;
}
export declare function SvFreshnessIndicator({ status, onNavigate, tabIndex }: SvIndicatorProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "status";
    "aria-label": string;
}> | import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "button";
    tabIndex: number;
    "aria-label": string;
    onClick: () => void;
    onKeyDown: (e: KeyboardEvent) => void;
}>;
interface RexIndicatorProps {
    status: RexStatus;
    onNavigate: (view: ViewId) => void;
    tabIndex: number;
}
export declare function RexCompletionIndicator({ status, onNavigate, tabIndex }: RexIndicatorProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "status";
    "aria-label": string;
}> | import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "button";
    tabIndex: number;
    "aria-label": string;
    onClick: () => void;
    onKeyDown: (e: KeyboardEvent) => void;
}>;
interface HenchIndicatorProps {
    status: HenchStatus;
    onNavigate: (view: ViewId) => void;
    tabIndex: number;
}
export declare function HenchActivityIndicator({ status, onNavigate, tabIndex }: HenchIndicatorProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "status";
    "aria-label": string;
}> | import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "button";
    tabIndex: number;
    "aria-label": string;
    onClick: () => void;
    onKeyDown: (e: KeyboardEvent) => void;
}>;

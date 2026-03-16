import type { Manifest, Zones } from "../external.js";
import type { ViewId } from "../types.js";
interface SidebarProps {
    view: ViewId;
    onNavigate: (view: ViewId) => void;
    manifest: Manifest | null;
    zones: Zones | null;
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    /** When set, restricts sidebar to a single package section. */
    scope?: string | null;
}
export declare function Sidebar({ view, onNavigate, manifest, zones, sidebarCollapsed, onToggleSidebar, scope }: SidebarProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "navigation";
    "aria-label": string;
}>;
export {};

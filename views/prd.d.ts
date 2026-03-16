/**
 * PRD view — displays Rex PRD hierarchy with interactive tree.
 *
 * Loads PRD data from /data/prd.json (served by the unified web server)
 * or accepts it via props. Manages task selection, detail panel content,
 * add item form, bulk actions, and merge preview.
 *
 * This component is a thin render shell that composes focused hooks
 * for data fetching, WebSocket updates, CRUD actions, and deep-linking.
 *
 * @see ../hooks/use-prd-data.ts — data fetching, polling, dedup
 * @see ../hooks/use-prd-websocket.ts — WebSocket message pipeline
 * @see ../hooks/use-prd-actions.ts — CRUD mutation handlers
 * @see ../hooks/use-prd-deep-link.ts — deep-link resolution
 * @see ../hooks/use-toast.ts — toast notification state
 */
import type { VNode } from "preact";
import type { PRDDocumentData } from "../components/prd-tree/index.js";
import type { DetailItem, NavigateTo } from "../types.js";
export interface PRDViewProps {
    /** Pre-loaded PRD data. If not provided, fetches from /data/prd.json. */
    prdData?: PRDDocumentData | null;
    /** Called when a PRD item is selected, to open the detail panel. */
    onSelectItem?: (detail: DetailItem | null) => void;
    /** Called with rendered TaskDetail content for the detail panel. */
    onDetailContent?: (content: VNode<any> | null) => void;
    /** When set, auto-select this task on mount (from deep-link URL). */
    initialTaskId?: string | null;
    /** Navigation callback for URL updates. */
    navigateTo?: NavigateTo;
}
export declare function PRDView({ prdData, onSelectItem, onDetailContent, initialTaskId, navigateTo }: PRDViewProps): VNode<import("preact").Attributes> | VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;

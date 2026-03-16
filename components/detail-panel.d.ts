import type { LoadedData, NavigateTo, DetailItem } from "../types.js";
import type { VNode } from "preact";
interface DetailPanelProps {
    detail: DetailItem | null;
    data?: LoadedData;
    navigateTo?: NavigateTo;
    onClose: () => void;
    /** Optional custom content renderer for PRD details (injected from PRDView). */
    prdDetailContent?: VNode<any> | null;
}
export declare function DetailPanel({ detail, data, navigateTo, onClose, prdDetailContent }: DetailPanelProps): VNode<import("preact").Attributes> | null;
export {};

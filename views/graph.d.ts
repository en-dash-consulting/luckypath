import type { LoadedData, DetailItem, NavigateTo } from "../types.js";
interface GraphProps {
    data: LoadedData;
    onSelect: (detail: DetailItem | null) => void;
    selectedFile?: string | null;
    selectedZone?: string | null;
    navigateTo?: NavigateTo;
}
export declare function Graph({ data, onSelect, selectedFile, selectedZone, navigateTo }: GraphProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & import("preact").HTMLAttributes<HTMLElement>> | import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
export {};

import type { LoadedData, NavigateTo, DetailItem } from "../types.js";
interface FilesViewProps {
    data: LoadedData;
    onSelect: (detail: DetailItem | null) => void;
    selectedFile?: string | null;
    setSelectedFile?: (file: string | null) => void;
    selectedZone?: string | null;
    navigateTo?: NavigateTo;
}
export declare function FilesView({ data, onSelect, selectedFile, setSelectedFile, selectedZone, navigateTo }: FilesViewProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & import("preact").HTMLAttributes<HTMLElement>> | import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
export {};

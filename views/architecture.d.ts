import type { LoadedData, NavigateTo, DetailItem } from "../types.js";
interface ArchitectureProps {
    data: LoadedData;
    onSelect: (detail: DetailItem | null) => void;
    navigateTo?: NavigateTo;
}
export declare function ArchitectureView({ data, onSelect, navigateTo }: ArchitectureProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & import("preact").HTMLAttributes<HTMLElement>> | import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
export {};

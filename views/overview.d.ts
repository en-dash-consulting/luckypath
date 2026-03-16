import type { LoadedData, NavigateTo, DetailItem } from "../types.js";
interface OverviewProps {
    data: LoadedData;
    navigateTo?: NavigateTo;
    onSelect?: (detail: DetailItem | null) => void;
}
export declare function Overview({ data, navigateTo, onSelect }: OverviewProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
export {};

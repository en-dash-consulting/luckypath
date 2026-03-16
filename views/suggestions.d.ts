import type { LoadedData } from "../types.js";
interface SuggestionsProps {
    data: LoadedData;
}
export declare function SuggestionsView({ data }: SuggestionsProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & import("preact").HTMLAttributes<HTMLElement>> | import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
export {};

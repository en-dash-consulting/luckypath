interface FilterOption {
    label: string;
    value: string;
    options: Array<{
        label: string;
        value: string;
    }>;
}
interface SearchFilterProps {
    placeholder?: string;
    value: string;
    onInput: (value: string) => void;
    resultCount?: number;
    totalCount?: number;
    filters?: FilterOption[];
}
export declare function SearchFilter({ placeholder, value, onInput, resultCount, totalCount, filters, }: SearchFilterProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    role: "search";
}>;
export {};

import { ComponentChildren } from "preact";
interface CollapsibleSectionProps {
    title: string;
    count?: number;
    defaultOpen?: boolean;
    threshold?: number;
    /** When set, open/closed state is persisted to localStorage across navigation. */
    storageKey?: string;
    children?: ComponentChildren;
}
export declare function CollapsibleSection({ title, count, defaultOpen, threshold, storageKey, children, }: CollapsibleSectionProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
export {};

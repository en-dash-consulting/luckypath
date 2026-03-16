import type { Finding } from "../../external.js";
interface FindingsListProps {
    findings: Finding[];
    legacyInsights?: string[];
    groupBy?: "severity" | "scope" | "type";
    searchable?: boolean;
    threshold?: number;
}
export declare function FindingsList({ findings, legacyInsights, groupBy, searchable, threshold, }: FindingsListProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    role: "region";
    "aria-label": string;
}>;
export {};

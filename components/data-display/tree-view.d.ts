import { VNode } from "preact";
export interface TreeNode {
    id: string;
    children: TreeNode[];
    [key: string]: unknown;
}
interface TreeViewProps {
    nodes: TreeNode[];
    renderNode: (node: TreeNode, depth: number) => VNode<any>;
    defaultExpandDepth?: number;
    filterMatch?: Set<string> | null;
}
export declare function TreeView({ nodes, renderNode, defaultExpandDepth, filterMatch, }: TreeViewProps): VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "tree";
    "aria-label": string;
}>;
export {};

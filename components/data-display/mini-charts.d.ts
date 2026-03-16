interface BarChartItem {
    label: string;
    value: number;
    color?: string;
}
interface BarChartProps {
    data: BarChartItem[];
    width?: number;
    height?: number;
}
export declare function BarChart({ data, width, height }: BarChartProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    viewBox: string;
    class: string;
    preserveAspectRatio: string;
}> | null;
interface FlowNode {
    id: string;
    label: string;
    color: string;
}
interface FlowEdge {
    from: string;
    to: string;
    weight: number;
}
interface FlowDiagramProps {
    nodes: FlowNode[];
    edges: FlowEdge[];
    width?: number;
    height?: number;
    onNodeClick?: (id: string) => void;
}
export declare function FlowDiagram({ nodes, edges, onNodeClick, }: FlowDiagramProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}> | null;
export {};

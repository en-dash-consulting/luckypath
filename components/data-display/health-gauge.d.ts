/**
 * Health Gauge - A radial progress indicator for metrics like cohesion/coupling.
 * Shows a value from 0-1 with color coding (green=good, orange=warning, red=bad).
 */
interface HealthGaugeProps {
    value: number;
    label: string;
    size?: number;
    inverted?: boolean;
}
export declare function HealthGauge({ value, label, size, inverted }: HealthGaugeProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    style: string;
}>;
/**
 * Pattern Badge - Shows a pattern or antipattern indicator.
 */
interface PatternBadgeProps {
    type: "pattern" | "antipattern";
    label: string;
}
export declare function PatternBadge({ type, label }: PatternBadgeProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
/**
 * Metric Card - A card displaying a single metric with visual indicator.
 */
interface MetricCardProps {
    value: string | number;
    label: string;
    trend?: "up" | "down" | "neutral";
    color?: string;
}
export declare function MetricCard({ value, label, trend, color }: MetricCardProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
export {};

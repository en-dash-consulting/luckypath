/**
 * Memory warning banner component.
 *
 * Displays a non-intrusive banner when memory usage approaches browser limits.
 * Provides actionable guidance based on the severity level. The banner is
 * dismissible but reappears if the level escalates.
 */
import type { MemorySnapshot, MemoryLevel } from "../performance/index.js";
export interface MemoryWarningProps {
    /** Current memory snapshot (null = no data yet). */
    snapshot: MemorySnapshot | null;
    /** Current memory warning level. */
    level: MemoryLevel;
    /** Whether the banner should be visible. */
    visible: boolean;
    /** Called when the user dismisses the banner. */
    onDismiss: () => void;
}
export declare function MemoryWarningBanner({ snapshot, level, visible, onDismiss, }: MemoryWarningProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "alert";
    "aria-live": "assertive";
}> | null;

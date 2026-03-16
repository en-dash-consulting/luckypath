/**
 * Lazy rendering wrapper for collapsed tree branches.
 *
 * Defers DOM creation for child nodes until the parent is expanded by the
 * user. On collapse, children are hidden via CSS immediately and then
 * unmounted from the DOM after a short delay. Rapid expand/collapse cycles
 * within the delay window reuse the existing DOM — preserving component
 * state and avoiding expensive re-mounts.
 *
 * Lifecycle:
 * 1. Initially collapsed → children not mounted (zero DOM cost)
 * 2. Parent expanded → children mount, CSS class reveals them
 * 3. Parent collapsed → CSS hides children; unmount scheduled after delay
 * 4. Rapid re-expand before unmount → cancels timer, children stay mounted
 *
 * @see ./prd-tree.ts — TreeNodes component that wraps child branches
 */
import type { VNode, ComponentChildren } from "preact";
/**
 * Delay in milliseconds before unmounting children after a collapse.
 * During this window, rapid re-expansion reuses the existing DOM (no re-mount).
 * @internal Exported for testing.
 */
export declare const UNMOUNT_DELAY_MS = 300;
export interface LazyChildrenProps {
    /** Whether the parent node is currently expanded. */
    isOpen: boolean;
    /** Render function that produces the child VDOM tree. Only called when
     *  children should be in the DOM — avoids VDOM creation when unmounted. */
    renderChildren: () => ComponentChildren;
}
/**
 * Wrapper that defers child DOM creation until the parent node is expanded.
 *
 * When `isOpen` transitions from false → true, children are mounted and
 * revealed via a CSS class. When `isOpen` transitions from true → false,
 * children are hidden immediately (CSS) and unmounted after
 * {@link UNMOUNT_DELAY_MS} to handle rapid toggling without flicker.
 */
export declare function LazyChildren({ isOpen, renderChildren }: LazyChildrenProps): VNode | null;

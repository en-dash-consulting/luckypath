/**
 * PNG-based logo components for n-dx and its sub-products.
 *
 * The original SVG logo components (NdxLogo, SourceVisionLogo, RexLogo,
 * HenchLogo) were replaced by PNG versions for better visual fidelity.
 */
interface LogoProps {
    size?: number;
    class?: string;
}
/** PNG logo for n-dx brand mark */
export declare function NdxLogoPng({ size, class: cls }: LogoProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    src: string;
    width: number;
    height: number;
    alt: string;
    "aria-hidden": "true";
    class: string;
}>;
/** PNG logo for a product section (sourcevision, rex, hench) */
export declare function ProductLogoPng({ product, size, class: cls }: LogoProps & {
    product: string;
}): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    src: string;
    width: number;
    height: number;
    alt: string;
    "aria-hidden": "true";
    class: string;
}> | null;
/**
 * Renders a branded section header with a product logo and title.
 * Used in both the sidebar (compact mode) and view page headers (full mode).
 */
export declare function BrandedHeader({ product, title, class: cls }: {
    product: "sourcevision" | "rex" | "hench";
    title: string;
    class?: string;
}): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
export {};

/**
 * Hench Config view — workflow configuration form editor.
 *
 * Displays current hench configuration in an editable form with proper
 * form controls (dropdowns, number inputs, toggles, tag lists). Shows
 * a real-time impact preview for pending changes, validates client-side,
 * and supports batch saving all changes at once.
 *
 * Data comes from GET /api/hench/config (read) and
 * PUT /api/hench/config (update).
 */
export interface ConfigField {
    path: string;
    label: string;
    description: string;
    type: "string" | "number" | "boolean" | "enum" | "array";
    enumValues?: string[];
    category: string;
    value: unknown;
    defaultValue: unknown;
    isDefault: boolean;
    impact: string;
}
export declare function formatDisplayValue(value: unknown): string;
/**
 * Parse a raw form value back to the proper typed value for a field.
 * Returns the coerced value or throws with a validation error.
 */
export declare function coerceFieldValue(field: ConfigField, rawValue: string): unknown;
/**
 * Validate a field's raw string value.
 * Returns null if valid, or an error message string.
 */
export declare function validateField(field: ConfigField, rawValue: string): string | null;
/** Compute impact text for a pending change (client-side preview). */
export declare function getPreviewImpact(field: ConfigField, rawValue: string): string;
export declare function HenchConfigView(): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}> | null;

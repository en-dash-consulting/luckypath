/**
 * Generic Integration Configuration view — dynamic form generation
 * based on integration schemas.
 *
 * This view lists all available integrations and generates configuration
 * forms dynamically from their schema definitions. It replaces the need
 * for per-integration hardcoded configuration views (though existing
 * views like NotionConfigView continue to work for backward compatibility).
 *
 * Data comes from:
 *   GET    /api/integrations                — list available integrations
 *   GET    /api/integrations/:id/schema     — get schema for one integration
 *   GET    /api/integrations/:id/config     — current config (masked)
 *   PUT    /api/integrations/:id/config     — save credentials
 *   DELETE /api/integrations/:id/config     — remove config
 */
interface FieldValidationRule {
    type: "pattern" | "minLength" | "maxLength" | "min" | "max" | "custom";
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    validator?: string;
    message: string;
}
interface FieldSelectOption {
    label: string;
    value: string;
    description?: string;
}
interface IntegrationFieldSchema {
    required: boolean;
    description: string;
    sensitive?: boolean;
    label?: string;
    inputType?: string;
    placeholder?: string;
    helpText?: string;
    docUrl?: string;
    docLabel?: string;
    defaultValue?: string | number | boolean;
    validationRules?: FieldValidationRule[];
    options?: FieldSelectOption[];
    group?: string;
    order?: number;
}
interface IntegrationFieldGroup {
    label: string;
    icon?: string;
    order?: number;
    description?: string;
}
interface IntegrationSchema {
    id: string;
    name: string;
    description: string;
    icon?: string;
    docsUrl?: string;
    setupGuide?: string[];
    fields: Record<string, IntegrationFieldSchema>;
    groups?: Record<string, IntegrationFieldGroup>;
    supportsConnectionTest?: boolean;
    supportsSchemaValidation?: boolean;
    builtIn?: boolean;
}
export declare function IntegrationConfigView(): import("preact").VNode<import("preact").Attributes & {
    schema: IntegrationSchema;
    onBack: () => void;
}> | import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
export {};

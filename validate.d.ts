/**
 * Client-side data validation for the sourcevision viewer.
 *
 * Zod schemas that validate JSON fetched from the server or dropped
 * as files. Lives in the viewer layer because the viewer is the sole
 * consumer — the server layer does its own domain-specific validation
 * independently.
 */
import { z } from "zod";
import type { V1 } from "./external.js";
export type ValidationResult<T> = {
    ok: true;
    data: T;
} | {
    ok: false;
    errors: z.ZodError;
};
export declare function validateManifest(data: unknown): ValidationResult<V1.Manifest>;
export declare function validateInventory(data: unknown): ValidationResult<V1.Inventory>;
export declare function validateImports(data: unknown): ValidationResult<V1.Imports>;
export declare function validateZones(data: unknown): ValidationResult<V1.Zones>;
export declare function validateComponents(data: unknown): ValidationResult<V1.Components>;
export declare function validateCallGraph(data: unknown): ValidationResult<V1.CallGraph>;

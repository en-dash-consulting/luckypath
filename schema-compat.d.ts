/**
 * Schema version migrations.
 * Ensures older output formats can be rendered by newer viewers.
 */
import type { LoadedData } from "./types.js";
type ModuleKey = keyof LoadedData;
/**
 * Apply any needed migrations to bring data up to the current schema version.
 * Returns the migrated data (or the original if no migrations needed).
 */
export declare function migrateData(module: string, data: unknown): unknown;
/**
 * Register a migration for a module.
 * Used for future schema updates.
 */
export declare function registerMigration(module: ModuleKey, from: string, to: string, migrate: (data: unknown) => unknown): void;
export {};

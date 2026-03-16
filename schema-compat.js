/**
 * Schema version migrations.
 * Ensures older output formats can be rendered by newer viewers.
 */
/** Current schema version. Inlined to avoid runtime import from schema/. */
const SCHEMA_VERSION = "1.0.0";
const migrations = {
    manifest: [],
    inventory: [],
    imports: [],
    zones: [],
    components: [],
    callGraph: [],
};
/**
 * Apply any needed migrations to bring data up to the current schema version.
 * Returns the migrated data (or the original if no migrations needed).
 */
export function migrateData(module, data) {
    if (!data || typeof data !== "object")
        return data;
    const record = data;
    const dataVersion = module === "manifest"
        ? record.schemaVersion
        : undefined;
    // If version matches current, no migration needed
    if (dataVersion === SCHEMA_VERSION)
        return data;
    const moduleMigrations = migrations[module];
    if (!moduleMigrations?.length)
        return data;
    let current = data;
    let currentVersion = dataVersion || "0.0.0";
    for (const migration of moduleMigrations) {
        if (currentVersion === migration.from) {
            current = migration.migrate(current);
            currentVersion = migration.to;
        }
    }
    return current;
}
/**
 * Register a migration for a module.
 * Used for future schema updates.
 */
export function registerMigration(module, from, to, migrate) {
    migrations[module].push({ from, to, migrate });
}
//# sourceMappingURL=schema-compat.js.map
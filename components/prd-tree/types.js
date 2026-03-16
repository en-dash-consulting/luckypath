/**
 * Types for PRD hierarchy visualization.
 *
 * These mirror the canonical types in packages/rex/src/schema/v1.ts.
 * Duplication is intentional: the viewer is bundled as standalone browser
 * code via esbuild and cannot import from the Rex Node.js package at
 * runtime. If the canonical Rex types change, update these to match.
 *
 * Drift between these types and the canonical source is caught by
 * compile-time consistency tests in tests/unit/server/type-consistency.test.ts.
 *
 * @see packages/rex/src/schema/v1.ts — canonical source: ItemLevel, ItemStatus, Priority, PRDItem, PRDDocument
 * @see packages/web/src/server/rex-gateway.ts — server-side gateway (re-exports from rex)
 */
export {};
//# sourceMappingURL=types.js.map
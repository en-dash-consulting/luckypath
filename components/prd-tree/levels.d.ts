/**
 * Level system helpers for the browser-bundled viewer.
 *
 * These mirror the canonical helpers in rex/src/schema/levels.ts but are
 * self-contained for browser bundling. They use the same level strings
 * as the rex types mirror in ./types.ts.
 *
 * @see packages/rex/src/schema/levels.ts — canonical source
 * @see ./types.ts — viewer-side type definitions
 */
import type { ItemLevel } from "./types.js";
/** Can this level exist at the tree root? Replaces: `level === "epic"` */
export declare function isRootLevel(level: string): boolean;
/**
 * Is this a work item (actionable leaf-level)?
 * Replaces: `level === "task" || level === "subtask"`
 */
export declare function isWorkItem(level: string): boolean;
/**
 * Is this a container level (groups other items)?
 * Replaces: `level === "epic" || level === "feature"`
 */
export declare function isContainerLevel(level: string): boolean;
/** Get the display label for a level. e.g. "epic" → "Epic" */
export declare function getLevelLabel(level: string): string;
/** Get the plural display label. e.g. "epic" → "Epics" */
export declare function getLevelPlural(level: string): string;
/** Get the emoji for a level. e.g. "epic" → "📦" */
export declare function getLevelEmoji(level: string): string;
/** Get the default child level. e.g. "epic" → "feature" */
export declare function getChildLevel(level: string): ItemLevel | null;

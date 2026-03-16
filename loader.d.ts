/**
 * Data loader for sourcevision viewer.
 * Fetches and validates .sourcevision/ JSON files.
 * Supports both server mode (fetch from /data/) and file drop mode.
 *
 * Memory-efficient strategies:
 * - loadModules(): lazy-load data files on demand in parallel
 * - Selective refresh: only reload files whose mtime changed
 */
import type { LoadedData } from "./types.js";
type DataChangeHandler = (data: LoadedData) => void;
export declare function getData(): LoadedData;
export declare function onDataChange(handler: DataChangeHandler): void;
/** Remove the current data-change handler (for cleanup on unmount). */
export declare function clearOnChange(): void;
/**
 * Lazy-load multiple modules in parallel. Only fetches modules that
 * are not already loaded. Returns the current data state.
 */
export declare function loadModules(keys: Array<keyof LoadedData>): Promise<LoadedData>;
/** Load data from dropped files */
export declare function loadFromFiles(files: FileList): Promise<LoadedData>;
/** Check if we're running in server mode */
export declare function detectMode(): Promise<"server" | "static">;
/**
 * Start polling for data changes (selective refresh — only changed files).
 * Registers with the centralized polling manager for automatic
 * suspend/resume based on tab visibility.
 */
export declare function startPolling(intervalMs?: number): void;
/** Stop polling for data changes */
export declare function stopPolling(): void;
export {};

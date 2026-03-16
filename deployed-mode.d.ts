/**
 * Deployed mode support — static export fetch adapter.
 *
 * When the viewer is exported as a static site via `ndx export`, a global
 * flag (`window.__NDX_DEPLOYED__`) is injected into the HTML.  This module
 * detects that flag and installs a fetch adapter that transparently rewrites
 * API requests to pre-rendered static JSON files.
 *
 * The adapter means no per-component changes are needed — existing `fetch()`
 * calls to `/api/*` and `/data/*` just work against the static file tree.
 */
interface DeployedConfig {
    basePath: string;
    exportedAt: string;
}
declare global {
    interface Window {
        __NDX_DEPLOYED__?: DeployedConfig;
    }
}
/** Check whether the viewer is running in deployed (static export) mode. */
export declare function isDeployedMode(): boolean;
/** Return the deployed config, or null if not in deployed mode. */
export declare function getDeployedConfig(): DeployedConfig | null;
/**
 * Install a global fetch adapter that rewrites requests for deployed mode.
 *
 * Rewrites:
 *   GET /api/*          → {basePath}api/*.json
 *   GET /data           → {basePath}data/index.json
 *   GET /data/status    → synthetic { mtimes: {} }
 *   GET /data/*         → {basePath}data/*
 *   Non-GET methods     → synthetic 405 response
 *   Everything else     → pass through
 */
export declare function installFetchAdapter(): void;
export {};

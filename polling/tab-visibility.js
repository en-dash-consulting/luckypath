/**
 * Centralized tab visibility state manager.
 *
 * Wraps the Page Visibility API to provide a single source of truth for
 * browser tab visibility state. All polling components subscribe to this
 * module instead of independently listening for visibility changes.
 *
 * Browser compatibility:
 *
 *   1. Standard API    — `document.visibilityState` + `visibilitychange`
 *   2. Webkit prefix   — `document.webkitVisibilityState` + `webkitvisibilitychange`
 *   3. MS prefix       — `document.msVisibilityState` + `msvisibilitychange`
 *   4. Focus/blur      — `window.focus` / `window.blur` (fallback when no API)
 *
 * State transitions:
 *
 *   visible -> hidden   Tab is backgrounded, minimized, or screen-locked.
 *   hidden  -> visible  Tab regains focus or is foregrounded.
 *
 * Designed as a standalone module with zero framework dependencies —
 * the Preact hook (`useTabVisibility`) is provided separately.
 */
// ─── Constants ───────────────────────────────────────────────────────────────
/** Maximum number of transitions kept in history for debugging. */
const MAX_TRANSITION_HISTORY = 50;
// ─── Module state ────────────────────────────────────────────────────────────
let currentState = "visible";
let stateChangedAt = Date.now();
let config = { onChange: null };
let listeners = [];
let boundHandler = null;
let boundFocusHandler = null;
let boundBlurHandler = null;
let transitionHistory = [];
let detectedMethod = "none";
let detectedEventName = null;
// ─── Browser API detection ──────────────────────────────────────────────────
/**
 * Probe the runtime environment for the best available Page Visibility API
 * variant. Called once on first use, result is cached.
 *
 * Priority:
 *   1. Standard API (`document.visibilityState`)
 *   2. Webkit prefix (`document.webkitVisibilityState`)
 *   3. MS prefix (`document.msVisibilityState`)
 *   4. Focus/blur fallback (window events)
 *   5. None (SSR or non-browser environment)
 */
export function detectVisibilityAPI() {
    if (typeof document === "undefined") {
        return { method: "none", eventName: null };
    }
    // Standard API
    if ("visibilityState" in document) {
        return { method: "standard", eventName: "visibilitychange" };
    }
    const doc = document;
    // Webkit prefix (Safari < 14, older Chrome)
    if ("webkitVisibilityState" in doc) {
        return { method: "webkit", eventName: "webkitvisibilitychange" };
    }
    // MS prefix (IE 10)
    if ("msVisibilityState" in doc) {
        return { method: "ms", eventName: "msvisibilitychange" };
    }
    // Focus/blur fallback — available in all window-bearing environments
    if (typeof window !== "undefined") {
        return { method: "focus-blur", eventName: null };
    }
    return { method: "none", eventName: null };
}
// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Build a snapshot from current module state. */
function buildSnapshot() {
    const now = Date.now();
    return {
        state: currentState,
        isVisible: currentState === "visible",
        since: new Date(stateChangedAt).toISOString(),
        durationMs: now - stateChangedAt,
        timestamp: new Date(now).toISOString(),
    };
}
function notifyListeners(snapshot) {
    for (const listener of listeners) {
        listener(snapshot);
    }
}
/** Record a state transition in the bounded history ring. */
function recordTransition(from, to) {
    transitionHistory.push({
        state: to,
        from,
        timestamp: new Date().toISOString(),
    });
    if (transitionHistory.length > MAX_TRANSITION_HISTORY) {
        transitionHistory = transitionHistory.slice(-MAX_TRANSITION_HISTORY);
    }
}
/**
 * Read the current visibility state from the best available API.
 * Handles standard, vendor-prefixed, and fallback scenarios.
 */
function readDocumentVisibility() {
    if (typeof document === "undefined")
        return "visible";
    switch (detectedMethod) {
        case "standard":
            return document.visibilityState === "visible" ? "visible" : "hidden";
        case "webkit": {
            const doc = document;
            return doc.webkitVisibilityState === "visible" ? "visible" : "hidden";
        }
        case "ms": {
            const doc = document;
            return doc.msVisibilityState === "visible" ? "visible" : "hidden";
        }
        // Focus/blur and none: return current tracked state (updated by focus/blur handlers)
        default:
            return currentState;
    }
}
// ─── Event handlers ─────────────────────────────────────────────────────────
function handleVisibilityChange() {
    const newState = readDocumentVisibility();
    if (newState === currentState)
        return;
    const previousState = currentState;
    currentState = newState;
    stateChangedAt = Date.now();
    recordTransition(previousState, newState);
    const snapshot = buildSnapshot();
    if (config.onChange) {
        config.onChange(snapshot, previousState);
    }
    notifyListeners(snapshot);
}
/** Focus handler for the fallback detection path. */
function handleWindowFocus() {
    if (currentState === "visible")
        return;
    const previousState = currentState;
    currentState = "visible";
    stateChangedAt = Date.now();
    recordTransition(previousState, "visible");
    const snapshot = buildSnapshot();
    if (config.onChange) {
        config.onChange(snapshot, previousState);
    }
    notifyListeners(snapshot);
}
/** Blur handler for the fallback detection path. */
function handleWindowBlur() {
    if (currentState === "hidden")
        return;
    const previousState = currentState;
    currentState = "hidden";
    stateChangedAt = Date.now();
    recordTransition(previousState, "hidden");
    const snapshot = buildSnapshot();
    if (config.onChange) {
        config.onChange(snapshot, previousState);
    }
    notifyListeners(snapshot);
}
// ─── Cleanup helpers ────────────────────────────────────────────────────────
/** Remove all event listeners regardless of detection method. */
function removeAllListeners() {
    // Remove visibilitychange listener (standard or prefixed)
    if (boundHandler && detectedEventName && typeof document !== "undefined") {
        document.removeEventListener(detectedEventName, boundHandler);
        boundHandler = null;
    }
    // Remove focus/blur listeners
    if (typeof window !== "undefined") {
        if (boundFocusHandler) {
            window.removeEventListener("focus", boundFocusHandler);
            boundFocusHandler = null;
        }
        if (boundBlurHandler) {
            window.removeEventListener("blur", boundBlurHandler);
            boundBlurHandler = null;
        }
    }
}
// ─── Public API ──────────────────────────────────────────────────────────────
/**
 * Start the tab visibility monitor. Detects the best available browser API
 * and begins listening for state changes.
 *
 * Safe to call multiple times — restarts with new config.
 */
export function startTabVisibilityMonitor(overrides = {}) {
    stopTabVisibilityMonitor();
    config = {
        onChange: overrides.onChange ?? null,
    };
    // Detect the best available API on first start.
    const detection = detectVisibilityAPI();
    detectedMethod = detection.method;
    detectedEventName = detection.eventName;
    // Capture the current state immediately.
    currentState = readDocumentVisibility();
    stateChangedAt = Date.now();
    // Bind and register event listeners based on detected method.
    if (detectedEventName && typeof document !== "undefined") {
        // Standard or vendor-prefixed Page Visibility API.
        boundHandler = handleVisibilityChange;
        document.addEventListener(detectedEventName, boundHandler);
    }
    else if (detectedMethod === "focus-blur" && typeof window !== "undefined") {
        // Focus/blur fallback — less precise but universally supported.
        boundFocusHandler = handleWindowFocus;
        boundBlurHandler = handleWindowBlur;
        window.addEventListener("focus", boundFocusHandler);
        window.addEventListener("blur", boundBlurHandler);
    }
    // "none" method: SSR — no events to listen to.
}
/** Stop the tab visibility monitor and remove all event listeners. */
export function stopTabVisibilityMonitor() {
    removeAllListeners();
}
/** Subscribe to visibility change events. Returns an unsubscribe function. */
export function onVisibilityChange(listener) {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter((l) => l !== listener);
    };
}
/** Get the current tab visibility state. */
export function getTabVisibility() {
    return currentState;
}
/** Get a full snapshot of the current tab visibility state. */
export function getTabVisibilitySnapshot() {
    return buildSnapshot();
}
/** Convenience check: is the tab currently visible? */
export function isTabVisible() {
    return currentState === "visible";
}
/**
 * Get the browser's Page Visibility API capabilities.
 * Reports which detection method is in use and whether fallbacks are active.
 */
export function getVisibilityCapabilities() {
    return {
        supported: detectedMethod !== "none",
        method: detectedMethod,
        nativeAPI: detectedMethod === "standard" ||
            detectedMethod === "webkit" ||
            detectedMethod === "ms",
        usingFallback: detectedMethod === "focus-blur",
        eventName: detectedEventName,
    };
}
/**
 * Get the recent transition history (up to 50 entries).
 * Useful for debugging visibility state patterns.
 */
export function getTransitionHistory() {
    return transitionHistory;
}
/** Reset all module state (for testing). */
export function resetTabVisibility() {
    stopTabVisibilityMonitor();
    currentState = "visible";
    stateChangedAt = Date.now();
    config = { onChange: null };
    listeners = [];
    transitionHistory = [];
    detectedMethod = "none";
    detectedEventName = null;
}
//# sourceMappingURL=tab-visibility.js.map
/**
 * Memory-aware refresh throttling and queuing.
 *
 * Provides intelligent refresh scheduling that considers current memory usage
 * and queues or delays refresh operations when memory pressure is high.
 *
 * Behaviour by memory level:
 *
 *   normal   → Full-speed refresh, max concurrency (3 parallel fetches).
 *   elevated → 2× interval, reduced concurrency (2 parallel fetches).
 *   warning  → 4× interval, serial execution only (1 at a time).
 *   critical → All refreshes paused, queue frozen until memory subsides.
 *
 * Designed as a standalone module with zero framework dependencies —
 * the Preact hook (`useRefreshThrottle`) is provided separately.
 */
import { onSnapshot, getLatestSnapshot, getCurrentLevel } from "./memory-monitor.js";
// ─── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_BASE_INTERVAL_MS = 5000;
const DEFAULT_AVG_REFRESH_MS = 800;
/** Interval multiplier per memory level. */
const INTERVAL_MULTIPLIERS = {
    normal: 1,
    elevated: 2,
    warning: 4,
    critical: Infinity, // effectively paused
};
/** Maximum concurrent refresh operations per memory level. */
const CONCURRENCY_LIMITS = {
    normal: 3,
    elevated: 2,
    warning: 1,
    critical: 0,
};
const PRIORITY_ORDER = {
    low: 0,
    normal: 1,
    high: 2,
};
// ─── Module state ────────────────────────────────────────────────────────────
let config = {
    baseIntervalMs: DEFAULT_BASE_INTERVAL_MS,
    avgRefreshMs: DEFAULT_AVG_REFRESH_MS,
    onChange: null,
};
let queue = [];
let activeCount = 0;
let completedCount = 0;
let currentMemoryLevel = "normal";
let unsubscribeMonitor = null;
let drainTimer = null;
let listeners = [];
// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Get the recommended interval for the current memory level. */
function computeRecommendedInterval() {
    const multiplier = INTERVAL_MULTIPLIERS[currentMemoryLevel];
    if (!isFinite(multiplier))
        return Infinity;
    return config.baseIntervalMs * multiplier;
}
/** Get max concurrency for the current memory level. */
function computeMaxConcurrency() {
    return CONCURRENCY_LIMITS[currentMemoryLevel];
}
/** Estimate milliseconds until the queue is fully drained. */
function computeEstimatedCompletion() {
    const total = queue.length + activeCount;
    if (total === 0)
        return 0;
    if (currentMemoryLevel === "critical")
        return -1; // paused, unknown
    const maxConcurrency = computeMaxConcurrency();
    if (maxConcurrency === 0)
        return -1;
    const batches = Math.ceil(total / maxConcurrency);
    return batches * config.avgRefreshMs;
}
/** Build the queue state snapshot from current module state. */
function buildState() {
    return {
        queueLength: queue.length,
        activeCount,
        paused: currentMemoryLevel === "critical",
        memoryLevel: currentMemoryLevel,
        recommendedIntervalMs: computeRecommendedInterval(),
        maxConcurrency: computeMaxConcurrency(),
        estimatedCompletionMs: computeEstimatedCompletion(),
        completedCount,
    };
}
function notifyListeners() {
    const state = buildState();
    if (config.onChange)
        config.onChange(state);
    for (const listener of listeners) {
        listener(state);
    }
}
/** Sort queue by priority (high first), then by enqueue time (FIFO within same priority). */
function sortQueue() {
    queue.sort((a, b) => {
        const priorityDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
        if (priorityDiff !== 0)
            return priorityDiff;
        return a.enqueuedAt.localeCompare(b.enqueuedAt);
    });
}
// ─── Queue drain ─────────────────────────────────────────────────────────────
/**
 * Attempt to drain the queue by starting as many operations as allowed
 * by the current concurrency limit.
 */
function drain() {
    const maxConcurrency = computeMaxConcurrency();
    while (queue.length > 0 && activeCount < maxConcurrency) {
        const item = queue.shift();
        if (!item)
            break;
        activeCount++;
        notifyListeners();
        item
            .execute()
            .catch(() => {
            // Swallow errors — individual refresh failures shouldn't break the queue.
        })
            .finally(() => {
            activeCount--;
            completedCount++;
            notifyListeners();
            // Continue draining after each completion.
            scheduleDrain();
        });
    }
}
/** Schedule a drain attempt — debounced to avoid tight loops. */
function scheduleDrain() {
    if (drainTimer !== null)
        return;
    drainTimer = setTimeout(() => {
        drainTimer = null;
        drain();
    }, 0);
}
// ─── Memory snapshot handler ─────────────────────────────────────────────────
function handleMemorySnapshot(snapshot) {
    const newLevel = snapshot.level;
    if (newLevel === currentMemoryLevel)
        return;
    const previousLevel = currentMemoryLevel;
    currentMemoryLevel = newLevel;
    notifyListeners();
    // If memory pressure eased, try to drain the queue.
    if (PRIORITY_ORDER[newLevel] === undefined &&
        computeMaxConcurrency() > 0) {
        scheduleDrain();
    }
    // More reliably: if new concurrency > 0 and we have queued items, drain.
    if (computeMaxConcurrency() > 0 && queue.length > 0) {
        scheduleDrain();
    }
}
// ─── Public API ──────────────────────────────────────────────────────────────
/**
 * Start the refresh throttle. Subscribes to the memory monitor and
 * immediately evaluates the current memory level.
 *
 * Safe to call multiple times — restarts with new config.
 */
export function startRefreshThrottle(overrides = {}) {
    stopRefreshThrottle();
    config = {
        baseIntervalMs: overrides.baseIntervalMs ?? DEFAULT_BASE_INTERVAL_MS,
        avgRefreshMs: overrides.avgRefreshMs ?? DEFAULT_AVG_REFRESH_MS,
        onChange: overrides.onChange ?? null,
    };
    // Evaluate current memory level immediately.
    const latest = getLatestSnapshot();
    if (latest) {
        currentMemoryLevel = latest.level;
    }
    else {
        currentMemoryLevel = getCurrentLevel();
    }
    // Subscribe to ongoing memory snapshots.
    unsubscribeMonitor = onSnapshot(handleMemorySnapshot);
    notifyListeners();
    // Drain any items that may have been enqueued before start.
    if (queue.length > 0) {
        scheduleDrain();
    }
}
/** Stop the refresh throttle and clean up subscriptions. */
export function stopRefreshThrottle() {
    if (unsubscribeMonitor) {
        unsubscribeMonitor();
        unsubscribeMonitor = null;
    }
    if (drainTimer !== null) {
        clearTimeout(drainTimer);
        drainTimer = null;
    }
}
/**
 * Enqueue a refresh operation. If an entry with the same key already exists
 * in the queue, it is replaced (deduplication). The operation will be
 * executed when concurrency allows and memory pressure permits.
 *
 * Returns `true` if the item was queued, `false` if executed immediately.
 */
export function enqueueRefresh(key, execute, priority = "normal") {
    // Deduplicate: remove any existing entry with the same key.
    queue = queue.filter((item) => item.key !== key);
    const item = {
        key,
        execute,
        priority,
        enqueuedAt: new Date().toISOString(),
    };
    queue.push(item);
    sortQueue();
    notifyListeners();
    scheduleDrain();
    // Return true if the item is still in the queue (queued, not immediately drained).
    // Since drain is async, the item is always initially queued.
    return true;
}
/**
 * Get the recommended polling interval for the current memory level.
 * Callers can use this to dynamically adjust their setInterval timing.
 */
export function getRecommendedInterval(baseIntervalMs = config.baseIntervalMs) {
    const multiplier = INTERVAL_MULTIPLIERS[currentMemoryLevel];
    if (!isFinite(multiplier))
        return Infinity;
    return baseIntervalMs * multiplier;
}
/** Subscribe to queue state changes. Returns an unsubscribe function. */
export function onQueueChange(listener) {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter((l) => l !== listener);
    };
}
/** Get the current queue state. */
export function getQueueState() {
    return buildState();
}
/** Get the current memory level being used for throttle decisions. */
export function getThrottleLevel() {
    return currentMemoryLevel;
}
/** Reset all module state (for testing). */
export function resetRefreshThrottle() {
    stopRefreshThrottle();
    queue = [];
    activeCount = 0;
    completedCount = 0;
    currentMemoryLevel = "normal";
    listeners = [];
    config = {
        baseIntervalMs: DEFAULT_BASE_INTERVAL_MS,
        avgRefreshMs: DEFAULT_AVG_REFRESH_MS,
        onChange: null,
    };
}
//# sourceMappingURL=refresh-throttle.js.map
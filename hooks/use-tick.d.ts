/**
 * Preact hook for shared elapsed-time tick updates.
 *
 * Wraps the batched tick dispatcher to provide a simple hook interface for
 * components that display live elapsed durations (e.g. task cards with
 * running timers). All components share a single 1-second setInterval via
 * the tick timer, and state updates are batched into a single
 * requestAnimationFrame callback via the batched tick dispatcher.
 *
 * When 20+ task cards are visible simultaneously, this reduces re-renders
 * from N individual setState calls to one batched reconciliation per tick.
 *
 * Usage:
 * ```tsx
 * // Replace:
 * //   const [elapsed, setElapsed] = useState(() => formatElapsed(startedAt));
 * //   useEffect(() => {
 * //     const id = setInterval(() => setElapsed(formatElapsed(startedAt)), 1000);
 * //     return () => clearInterval(id);
 * //   }, [startedAt]);
 * //
 * // With:
 * const elapsed = useTick(startedAt, formatElapsed);
 * ```
 */
/**
 * Subscribe to batched 1-second tick updates and return a formatted
 * elapsed-time string that updates every second.
 *
 * State updates are batched across all `useTick` instances via RAF,
 * so Preact reconciles all elapsed time displays in a single pass.
 *
 * Includes an equality check to skip redundant re-renders when the
 * formatted value hasn't changed (e.g. timer precision edge cases,
 * or formatters that produce the same string across consecutive ticks).
 *
 * @param startedAt - ISO 8601 timestamp of when the timer began.
 * @param formatter - Pure function that converts a start timestamp to a
 *                    display string. Called once per tick.
 *                    Receives the ISO string and returns the formatted output.
 * @returns The current formatted elapsed-time string.
 */
export declare function useTick(startedAt: string, formatter: (startedAt: string) => string): string;

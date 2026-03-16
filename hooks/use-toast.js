/**
 * Simple toast notification state hook.
 *
 * Manages a single toast message with configurable type (success/error)
 * and auto-dismiss duration. Extracted from PRDView to enable reuse
 * across views that need lightweight user feedback.
 */
import { useState, useCallback } from "preact/hooks";
/**
 * Hook providing toast notification state and display logic.
 *
 * Returns a stable `showToast` callback that sets the message, type,
 * and schedules auto-dismissal. Only one toast is visible at a time —
 * calling `showToast` again replaces the current toast.
 */
export function useToast() {
    const [toast, setToast] = useState(null);
    const [toastType, setToastType] = useState("success");
    const showToast = useCallback((message, type = "success", duration = 3000) => {
        setToast(message);
        setToastType(type);
        setTimeout(() => setToast(null), duration);
    }, []);
    return { toast, toastType, showToast };
}
//# sourceMappingURL=use-toast.js.map
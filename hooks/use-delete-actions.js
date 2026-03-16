/**
 * Delete action hooks — optimistic removal, modal confirmation, and detail panel deletion.
 *
 * Extracted from usePRDActions to isolate delete state management and
 * the optimistic-delete-then-reconcile pattern from other mutations.
 *
 * @see ./use-prd-actions.ts — parent hook that composes this
 */
import { useState, useCallback } from "preact/hooks";
import { findItemById, collectSubtreeIds, removeItemById } from "../components/prd-tree/tree-utils.js";
/**
 * Hook for delete actions — optimistic removal, modal confirmation, and detail panel deletion.
 */
export function useDeleteActions({ data, setData, fetchPRDData, fetchTaskUsage, showToast, selectedItemId, setSelectedItemId, setBulkSelectedIds, onDetailContent, }) {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletingItemId, setDeletingItemId] = useState(null);
    // ── Core remove (optimistic delete + reconcile) ─────────────────
    const handleRemoveItem = useCallback(async (id) => {
        const targetItem = data ? findItemById(data.items, id) : null;
        const affectedIds = targetItem ? collectSubtreeIds(targetItem) : new Set([id]);
        setDeletingItemId(id);
        // Optimistic removal
        setData((prev) => {
            if (!prev)
                return prev;
            return { ...prev, items: removeItemById(prev.items, id) };
        });
        // Clean up bulk selection for deleted items
        setBulkSelectedIds((prev) => {
            if (prev.size === 0)
                return prev;
            let changed = false;
            const next = new Set(prev);
            for (const affectedId of affectedIds) {
                if (next.has(affectedId)) {
                    next.delete(affectedId);
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
        // Deselect if the selected item is being deleted
        if (selectedItemId && affectedIds.has(selectedItemId)) {
            setSelectedItemId(null);
            if (onDetailContent)
                onDetailContent(null);
            history.replaceState({ view: "prd", file: null, zone: null, runId: null, taskId: null }, "", "/prd");
        }
        try {
            const res = await fetch(`/api/rex/items/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({ error: "Delete failed" }));
                throw new Error(errBody.error || `HTTP ${res.status}`);
            }
            const result = await res.json();
            showToast(`Deleted ${result.level}: ${result.title}`);
            await fetchPRDData();
            await fetchTaskUsage();
        }
        catch (err) {
            await fetchPRDData();
            throw err;
        }
        finally {
            setDeletingItemId(null);
        }
    }, [data, selectedItemId, onDetailContent, setData, setSelectedItemId, setBulkSelectedIds, fetchPRDData, fetchTaskUsage, showToast]);
    // ── Remove from tree (opens modal) ───────────────────────────────
    const handleRemoveItemFromTree = useCallback((item) => {
        setDeleteTarget(item);
    }, []);
    // ── Confirm delete (modal callback) ──────────────────────────────
    const handleConfirmDelete = useCallback(async (id) => {
        try {
            await handleRemoveItem(id);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : "Delete failed";
            showToast(`Failed to delete item: ${msg}`, "error", 4000);
        }
        setDeleteTarget(null);
    }, [handleRemoveItem, showToast]);
    // ── Remove from detail panel ─────────────────────────────────────
    const handleRemoveFromDetail = useCallback(async (id) => {
        try {
            await handleRemoveItem(id);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : "Delete failed";
            showToast(`Failed to delete item: ${msg}`, "error", 4000);
            throw err; // Re-throw so TaskDetail can reset its confirming state
        }
    }, [handleRemoveItem, showToast]);
    return {
        deleteTarget,
        setDeleteTarget,
        deletingItemId,
        handleRemoveItemFromTree,
        handleConfirmDelete,
        handleRemoveFromDetail,
    };
}
//# sourceMappingURL=use-delete-actions.js.map
/**
 * Pure search/filter functions for the PRD tree.
 *
 * Provides case-insensitive substring matching against item titles and
 * descriptions, with optional tag and status facet filters that narrow
 * results further. Returns both the set of matching item IDs and their
 * ancestor IDs (to preserve tree context in filtered views).
 *
 * @see ./prd-tree.ts — integrating component
 * @see ./virtual-scroll.ts — flattenVisibleTree respects search results
 */
import { h } from "preact";
// ── Core search ──────────────────────────────────────────────────────────────
/**
 * Check if a single item passes the facet filters (ignoring text query).
 * Tag facets use AND logic: item must have every selected tag.
 * Status facets use OR logic: item status must be one of the selected statuses.
 */
function itemPassesFacets(item, facets) {
    // Status facet: OR logic — item's status must be in the set
    if (facets.statuses && facets.statuses.size > 0) {
        if (!facets.statuses.has(item.status))
            return false;
    }
    // Tag facet: AND logic — item must have ALL selected tags
    if (facets.tags && facets.tags.size > 0) {
        const itemTags = item.tags ?? [];
        for (const tag of facets.tags) {
            if (!itemTags.includes(tag))
                return false;
        }
    }
    return true;
}
/**
 * Search the PRD tree for items matching a query string and/or facet filters.
 *
 * Matching rules:
 * - Case-insensitive substring match against title and description
 * - Tag facets narrow results to items having ALL selected tags (AND)
 * - Status facets narrow results to items matching ANY selected status (OR)
 * - Text query and facets combine with AND logic
 * - Empty query with no facets returns an empty result (caller shows full tree)
 * - Ancestor nodes of matches are included in visibleIds/expandIds
 *
 * Complexity: O(N) where N = total tree nodes.
 */
export function searchTree(items, query, facets) {
    const trimmed = query.trim().toLowerCase();
    const hasTextQuery = trimmed.length > 0;
    const hasFacets = facets != null && ((facets.tags != null && facets.tags.size > 0) ||
        (facets.statuses != null && facets.statuses.size > 0));
    if (!hasTextQuery && !hasFacets) {
        return {
            matchIds: new Set(),
            ancestorIds: new Set(),
            visibleIds: new Set(),
            expandIds: new Set(),
            matchCount: 0,
        };
    }
    const matchIds = new Set();
    const ancestorIds = new Set();
    // Walk the tree, collecting matches and propagating ancestor info upward.
    function walk(nodes, ancestors) {
        let anyMatch = false;
        for (const item of nodes) {
            // Text matching (skip if no text query — facets-only mode)
            let textMatch = true;
            if (hasTextQuery) {
                const titleMatch = item.title.toLowerCase().includes(trimmed);
                const descMatch = item.description
                    ? item.description.toLowerCase().includes(trimmed)
                    : false;
                textMatch = titleMatch || descMatch;
            }
            // Facet matching
            const facetMatch = hasFacets ? itemPassesFacets(item, facets) : true;
            const selfMatch = textMatch && facetMatch;
            // Recurse into children first to detect descendant matches.
            const childAncestors = [...ancestors, item.id];
            const childMatch = item.children
                ? walk(item.children, childAncestors)
                : false;
            if (selfMatch) {
                matchIds.add(item.id);
                // Mark all ancestors as visible
                for (const aid of ancestors) {
                    ancestorIds.add(aid);
                }
                anyMatch = true;
            }
            if (childMatch) {
                // Item is an ancestor of a match — already added by the child walk
                anyMatch = true;
            }
        }
        return anyMatch;
    }
    walk(items, []);
    const visibleIds = new Set([...matchIds, ...ancestorIds]);
    // Expand all ancestors so matches are visible
    const expandIds = new Set(ancestorIds);
    return {
        matchIds,
        ancestorIds,
        visibleIds,
        expandIds,
        matchCount: matchIds.size,
    };
}
// ── Tag collection ──────────────────────────────────────────────────────────
/**
 * Collect all unique tags from the PRD tree, sorted alphabetically.
 * Used to populate tag facet chips dynamically.
 */
export function collectAllTags(items) {
    const tags = new Set();
    function walk(nodes) {
        for (const item of nodes) {
            if (item.tags) {
                for (const tag of item.tags) {
                    tags.add(tag);
                }
            }
            if (item.children)
                walk(item.children);
        }
    }
    walk(items);
    return [...tags].sort();
}
/**
 * Check if an item (or any descendant) is in the visible set.
 * Used by flattenVisibleTree when a search is active.
 */
export function itemMatchesSearch(item, visibleIds) {
    if (visibleIds.has(item.id))
        return true;
    if (item.children) {
        return item.children.some((child) => itemMatchesSearch(child, visibleIds));
    }
    return false;
}
// ── Text highlighting ────────────────────────────────────────────────────────
/**
 * Highlight all occurrences of `query` within `text`, returning an array
 * of string and VNode fragments suitable for Preact rendering.
 *
 * Uses case-insensitive matching. Non-matching segments are plain strings;
 * matching segments are wrapped in `<mark class="prd-search-highlight">`.
 *
 * Returns `[text]` unchanged when query is empty.
 */
export function highlightSearchText(text, query) {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || !text)
        return [text];
    const lower = text.toLowerCase();
    const fragments = [];
    let cursor = 0;
    while (cursor < text.length) {
        const idx = lower.indexOf(trimmed, cursor);
        if (idx === -1) {
            fragments.push(text.slice(cursor));
            break;
        }
        // Text before match
        if (idx > cursor) {
            fragments.push(text.slice(cursor, idx));
        }
        // Matched text
        fragments.push(h("mark", { class: "prd-search-highlight" }, text.slice(idx, idx + trimmed.length)));
        cursor = idx + trimmed.length;
    }
    return fragments;
}
//# sourceMappingURL=tree-search.js.map
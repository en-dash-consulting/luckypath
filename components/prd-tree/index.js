/**
 * PRD tree barrel — re-exports consumed by external modules.
 *
 * Includes the main PRDTree component, filter components, shared types,
 * and internal utilities (lazy-children, listener-lifecycle) whose exports
 * are re-exported here to make zone membership compiler-visible.
 */
export { PRDTree } from "./prd-tree.js";
export { StatusFilter, defaultStatusFilter } from "./status-filter.js";
export { FacetFilter } from "./facet-filter.js";
export { LazyChildren, UNMOUNT_DELAY_MS } from "./lazy-children.js";
export { ListenerLifecycleManager, useNodeListeners } from "./listener-lifecycle.js";
export { SmartAddInput } from "./smart-add-input.js";
export { BatchImportPanel } from "./batch-import-panel.js";
export { ProposalEditor } from "./proposal-editor.js";
//# sourceMappingURL=index.js.map
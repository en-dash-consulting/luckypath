/**
 * Proposal editor — editable tree for reviewing and modifying proposals
 * before accepting them into the PRD.
 *
 * Provides inline editing for titles, descriptions, and metadata.
 * Each node (epic/feature/task) can be independently selected or deselected.
 * Validates that selected items have non-empty titles before acceptance.
 */
import { h, Fragment } from "preact";
import { useState, useCallback, useMemo } from "preact/hooks";
// ── Helpers ──────────────────────────────────────────────────────────
/** Convert raw proposals into editable state. All items selected by default. */
function toEditable(proposals) {
    return proposals.map((p) => ({
        epicTitle: p.epic.title,
        epicDescription: p.epic.description ?? "",
        selected: true,
        expanded: true,
        features: p.features.map((f) => ({
            title: f.title,
            description: f.description ?? "",
            selected: true,
            expanded: false,
            tasks: f.tasks.map((t) => ({
                title: t.title,
                description: t.description ?? "",
                priority: t.priority ?? "",
                tags: (t.tags ?? []).join(", "),
                selected: true,
            })),
        })),
    }));
}
/** Validate the editable tree. Returns errors for selected items missing titles. */
function validate(proposals) {
    const errors = [];
    for (let pi = 0; pi < proposals.length; pi++) {
        const p = proposals[pi];
        if (!p.selected)
            continue;
        if (!p.epicTitle.trim()) {
            errors.push({ path: `${pi}`, message: "Epic title is required" });
        }
        for (let fi = 0; fi < p.features.length; fi++) {
            const f = p.features[fi];
            if (!f.selected)
                continue;
            if (!f.title.trim()) {
                errors.push({ path: `${pi}.${fi}`, message: "Feature title is required" });
            }
            for (let ti = 0; ti < f.tasks.length; ti++) {
                const t = f.tasks[ti];
                if (!t.selected)
                    continue;
                if (!t.title.trim()) {
                    errors.push({ path: `${pi}.${fi}.${ti}`, message: "Task title is required" });
                }
            }
        }
    }
    return errors;
}
/** Count total selected items (epics + features + tasks). */
function countSelected(proposals) {
    let epics = 0;
    let features = 0;
    let tasks = 0;
    for (const p of proposals) {
        if (!p.selected)
            continue;
        epics++;
        for (const f of p.features) {
            if (!f.selected)
                continue;
            features++;
            tasks += f.tasks.filter((t) => t.selected).length;
        }
    }
    return { epics, features, tasks };
}
// ── Component ────────────────────────────────────────────────────────
export function ProposalEditor({ proposals: rawProposals, onAccepted, onCancel }) {
    const [proposals, setProposals] = useState(() => toEditable(rawProposals));
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showValidation, setShowValidation] = useState(false);
    const validationErrors = useMemo(() => validate(proposals), [proposals]);
    const counts = useMemo(() => countSelected(proposals), [proposals]);
    const totalSelected = counts.epics + counts.features + counts.tasks;
    // ── Updaters ─────────────────────────────────────────────────────
    const updateProposal = useCallback((pi, updates) => {
        setProposals((prev) => {
            const next = [...prev];
            next[pi] = { ...next[pi], ...updates };
            return next;
        });
    }, []);
    const updateFeature = useCallback((pi, fi, updates) => {
        setProposals((prev) => {
            const next = [...prev];
            const features = [...next[pi].features];
            features[fi] = { ...features[fi], ...updates };
            next[pi] = { ...next[pi], features };
            return next;
        });
    }, []);
    const updateTask = useCallback((pi, fi, ti, updates) => {
        setProposals((prev) => {
            const next = [...prev];
            const features = [...next[pi].features];
            const tasks = [...features[fi].tasks];
            tasks[ti] = { ...tasks[ti], ...updates };
            features[fi] = { ...features[fi], tasks };
            next[pi] = { ...next[pi], features };
            return next;
        });
    }, []);
    // ── Toggle selection cascading ─────────────────────────────────
    const toggleEpic = useCallback((pi) => {
        setProposals((prev) => {
            const next = [...prev];
            const newSelected = !next[pi].selected;
            const features = next[pi].features.map((f) => ({
                ...f,
                selected: newSelected,
                tasks: f.tasks.map((t) => ({ ...t, selected: newSelected })),
            }));
            next[pi] = { ...next[pi], selected: newSelected, features };
            return next;
        });
    }, []);
    const toggleFeature = useCallback((pi, fi) => {
        setProposals((prev) => {
            const next = [...prev];
            const features = [...next[pi].features];
            const newSelected = !features[fi].selected;
            features[fi] = {
                ...features[fi],
                selected: newSelected,
                tasks: features[fi].tasks.map((t) => ({ ...t, selected: newSelected })),
            };
            next[pi] = { ...next[pi], features };
            return next;
        });
    }, []);
    const toggleTask = useCallback((pi, fi, ti) => {
        setProposals((prev) => {
            const next = [...prev];
            const features = [...next[pi].features];
            const tasks = [...features[fi].tasks];
            tasks[ti] = { ...tasks[ti], selected: !tasks[ti].selected };
            features[fi] = { ...features[fi], tasks };
            next[pi] = { ...next[pi], features };
            return next;
        });
    }, []);
    // ── Select all / none ──────────────────────────────────────────
    const selectAll = useCallback(() => {
        setProposals((prev) => prev.map((p) => ({
            ...p,
            selected: true,
            features: p.features.map((f) => ({
                ...f,
                selected: true,
                tasks: f.tasks.map((t) => ({ ...t, selected: true })),
            })),
        })));
    }, []);
    const selectNone = useCallback(() => {
        setProposals((prev) => prev.map((p) => ({
            ...p,
            selected: false,
            features: p.features.map((f) => ({
                ...f,
                selected: false,
                tasks: f.tasks.map((t) => ({ ...t, selected: false })),
            })),
        })));
    }, []);
    // ── Submit ─────────────────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        setShowValidation(true);
        const errors = validate(proposals);
        if (errors.length > 0) {
            setError(`${errors.length} validation error${errors.length > 1 ? "s" : ""} — fix highlighted fields before accepting`);
            return;
        }
        if (totalSelected === 0) {
            setError("No items selected");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const payload = proposals
                .map((p) => ({
                epic: { title: p.epicTitle, description: p.epicDescription || undefined },
                features: p.features.map((f) => ({
                    title: f.title,
                    description: f.description || undefined,
                    tasks: f.tasks.map((t) => ({
                        title: t.title,
                        description: t.description || undefined,
                        priority: t.priority || undefined,
                        tags: t.tags ? t.tags.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
                        selected: t.selected,
                    })),
                    selected: f.selected,
                })),
                selected: p.selected,
            }));
            const res = await fetch("/api/rex/proposals/accept-edited", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proposals: payload }),
            });
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({ error: "Accept failed" }));
                throw new Error(errBody.error || `HTTP ${res.status}`);
            }
            onAccepted();
        }
        catch (err) {
            setError(String(err));
        }
        finally {
            setSubmitting(false);
        }
    }, [proposals, totalSelected, onAccepted]);
    // ── Render ─────────────────────────────────────────────────────
    return h("div", { class: "proposal-editor" }, 
    // Header
    h("div", { class: "proposal-editor-header" }, h("h3", { class: "proposal-editor-title" }, "Review & Edit Proposals"), h("p", { class: "proposal-editor-subtitle" }, "Edit titles and descriptions, then select which items to accept into the PRD.")), 
    // Selection controls
    h("div", { class: "proposal-editor-toolbar" }, h("div", { class: "proposal-editor-counts" }, h("span", { class: "proposal-editor-count-badge" }, `${counts.epics} epic${counts.epics !== 1 ? "s" : ""}`), h("span", { class: "proposal-editor-count-badge" }, `${counts.features} feature${counts.features !== 1 ? "s" : ""}`), h("span", { class: "proposal-editor-count-badge" }, `${counts.tasks} task${counts.tasks !== 1 ? "s" : ""}`)), h("div", { class: "proposal-editor-select-btns" }, h("button", {
        class: "proposal-editor-select-btn",
        onClick: selectAll,
        type: "button",
    }, "Select All"), h("button", {
        class: "proposal-editor-select-btn",
        onClick: selectNone,
        type: "button",
    }, "Select None"))), 
    // Validation errors summary
    showValidation && validationErrors.length > 0
        ? h("div", { class: "proposal-editor-errors", role: "alert" }, h("strong", null, `${validationErrors.length} validation error${validationErrors.length > 1 ? "s" : ""}:`), h("ul", null, validationErrors.map((e, i) => h("li", { key: i }, e.message))))
        : null, 
    // Error banner
    error && (!showValidation || validationErrors.length === 0)
        ? h("div", { class: "proposal-editor-error", role: "alert" }, error)
        : null, 
    // Proposal tree
    h("div", { class: "proposal-editor-tree" }, proposals.map((p, pi) => h(ProposalEpicNode, {
        key: pi,
        proposal: p,
        pi,
        showValidation,
        validationErrors,
        onToggle: () => toggleEpic(pi),
        onExpand: () => updateProposal(pi, { expanded: !p.expanded }),
        onUpdateTitle: (v) => updateProposal(pi, { epicTitle: v }),
        onUpdateDescription: (v) => updateProposal(pi, { epicDescription: v }),
        onToggleFeature: (fi) => toggleFeature(pi, fi),
        onExpandFeature: (fi) => {
            const f = p.features[fi];
            updateFeature(pi, fi, { expanded: !f.expanded });
        },
        onUpdateFeature: (fi, updates) => updateFeature(pi, fi, updates),
        onToggleTask: (fi, ti) => toggleTask(pi, fi, ti),
        onUpdateTask: (fi, ti, updates) => updateTask(pi, fi, ti, updates),
    }))), 
    // Action bar
    h("div", { class: "proposal-editor-actions" }, h("button", {
        class: "proposal-editor-btn proposal-editor-btn-cancel",
        onClick: onCancel,
        type: "button",
        disabled: submitting,
    }, "Cancel"), h("button", {
        class: "proposal-editor-btn proposal-editor-btn-accept",
        onClick: handleSubmit,
        type: "button",
        disabled: submitting || totalSelected === 0,
    }, submitting
        ? "Accepting..."
        : `Accept ${totalSelected} Item${totalSelected !== 1 ? "s" : ""}`)));
}
function ProposalEpicNode({ proposal: p, pi, showValidation, validationErrors, onToggle, onExpand, onUpdateTitle, onUpdateDescription, onToggleFeature, onExpandFeature, onUpdateFeature, onToggleTask, onUpdateTask, }) {
    const hasError = showValidation && validationErrors.some((e) => e.path === `${pi}`);
    const featureCount = p.features.length;
    const taskCount = p.features.reduce((sum, f) => sum + f.tasks.length, 0);
    return h("div", { class: `proposal-editor-epic${p.selected ? "" : " deselected"}${hasError ? " has-error" : ""}` }, 
    // Epic header row
    h("div", { class: "proposal-editor-epic-header" }, h("input", {
        type: "checkbox",
        checked: p.selected,
        onChange: onToggle,
        "aria-label": `Select epic: ${p.epicTitle}`,
    }), h("span", { class: "prd-level-badge prd-level-epic" }, "Epic"), h("input", {
        type: "text",
        class: `proposal-editor-input proposal-editor-input-title${hasError ? " input-error" : ""}`,
        value: p.epicTitle,
        onInput: (e) => onUpdateTitle(e.target.value),
        placeholder: "Epic title (required)",
        disabled: !p.selected,
    }), h("span", { class: "proposal-editor-item-count" }, `${featureCount}F / ${taskCount}T`), h("button", {
        class: `proposal-editor-expand${p.expanded ? " open" : ""}`,
        onClick: onExpand,
        type: "button",
        "aria-label": p.expanded ? "Collapse" : "Expand",
    }, "\u25B6")), 
    // Epic description (shown when expanded)
    p.expanded
        ? h(Fragment, null, h("div", { class: "proposal-editor-epic-body" }, h("textarea", {
            class: "proposal-editor-textarea",
            value: p.epicDescription,
            onInput: (e) => onUpdateDescription(e.target.value),
            placeholder: "Description (optional)",
            rows: 2,
            disabled: !p.selected,
        })), 
        // Features
        p.features.map((f, fi) => h(ProposalFeatureNode, {
            key: fi,
            feature: f,
            pi,
            fi,
            parentSelected: p.selected,
            showValidation,
            validationErrors,
            onToggle: () => onToggleFeature(fi),
            onExpand: () => onExpandFeature(fi),
            onUpdate: (updates) => onUpdateFeature(fi, updates),
            onToggleTask: (ti) => onToggleTask(fi, ti),
            onUpdateTask: (ti, updates) => onUpdateTask(fi, ti, updates),
        })))
        : null);
}
function ProposalFeatureNode({ feature: f, pi, fi, parentSelected, showValidation, validationErrors, onToggle, onExpand, onUpdate, onToggleTask, onUpdateTask, }) {
    const hasError = showValidation && validationErrors.some((e) => e.path === `${pi}.${fi}`);
    const disabled = !parentSelected || !f.selected;
    return h("div", { class: `proposal-editor-feature${f.selected ? "" : " deselected"}${hasError ? " has-error" : ""}` }, 
    // Feature header
    h("div", { class: "proposal-editor-feature-header" }, h("input", {
        type: "checkbox",
        checked: f.selected,
        onChange: onToggle,
        disabled: !parentSelected,
        "aria-label": `Select feature: ${f.title}`,
    }), h("span", { class: "prd-level-badge prd-level-feature" }, "Feature"), h("input", {
        type: "text",
        class: `proposal-editor-input proposal-editor-input-title${hasError ? " input-error" : ""}`,
        value: f.title,
        onInput: (e) => onUpdate({ title: e.target.value }),
        placeholder: "Feature title (required)",
        disabled,
    }), h("span", { class: "proposal-editor-item-count" }, `${f.tasks.length} task${f.tasks.length !== 1 ? "s" : ""}`), h("button", {
        class: `proposal-editor-expand${f.expanded ? " open" : ""}`,
        onClick: onExpand,
        type: "button",
        "aria-label": f.expanded ? "Collapse" : "Expand",
    }, "\u25B6")), 
    // Feature body
    f.expanded
        ? h(Fragment, null, h("div", { class: "proposal-editor-feature-body" }, h("textarea", {
            class: "proposal-editor-textarea",
            value: f.description,
            onInput: (e) => onUpdate({ description: e.target.value }),
            placeholder: "Description (optional)",
            rows: 2,
            disabled,
        })), 
        // Tasks
        f.tasks.map((t, ti) => h(ProposalTaskNode, {
            key: ti,
            task: t,
            pi,
            fi,
            ti,
            parentSelected: parentSelected && f.selected,
            showValidation,
            validationErrors,
            onToggle: () => onToggleTask(ti),
            onUpdate: (updates) => onUpdateTask(ti, updates),
        })))
        : null);
}
function ProposalTaskNode({ task: t, pi, fi, ti, parentSelected, showValidation, validationErrors, onToggle, onUpdate, }) {
    const [expanded, setExpanded] = useState(false);
    const hasError = showValidation && validationErrors.some((e) => e.path === `${pi}.${fi}.${ti}`);
    const disabled = !parentSelected || !t.selected;
    return h("div", { class: `proposal-editor-task${t.selected ? "" : " deselected"}${hasError ? " has-error" : ""}` }, 
    // Task header
    h("div", { class: "proposal-editor-task-header" }, h("input", {
        type: "checkbox",
        checked: t.selected,
        onChange: onToggle,
        disabled: !parentSelected,
        "aria-label": `Select task: ${t.title}`,
    }), h("span", { class: "prd-level-badge prd-level-task" }, "Task"), h("input", {
        type: "text",
        class: `proposal-editor-input proposal-editor-input-title${hasError ? " input-error" : ""}`,
        value: t.title,
        onInput: (e) => onUpdate({ title: e.target.value }),
        placeholder: "Task title (required)",
        disabled,
    }), t.priority
        ? h("span", { class: `prd-priority-badge prd-priority-${t.priority}` }, t.priority)
        : null, h("button", {
        class: `proposal-editor-expand${expanded ? " open" : ""}`,
        onClick: () => setExpanded(!expanded),
        type: "button",
        "aria-label": expanded ? "Collapse" : "Expand",
    }, "\u25B6")), 
    // Task details (expanded)
    expanded
        ? h("div", { class: "proposal-editor-task-body" }, h("textarea", {
            class: "proposal-editor-textarea",
            value: t.description,
            onInput: (e) => onUpdate({ description: e.target.value }),
            placeholder: "Description (optional)",
            rows: 2,
            disabled,
        }), h("div", { class: "proposal-editor-task-meta" }, h("label", { class: "proposal-editor-meta-label" }, "Priority", h("select", {
            class: "proposal-editor-select",
            value: t.priority,
            onChange: (e) => onUpdate({ priority: e.target.value }),
            disabled,
        }, h("option", { value: "" }, "None"), h("option", { value: "critical" }, "Critical"), h("option", { value: "high" }, "High"), h("option", { value: "medium" }, "Medium"), h("option", { value: "low" }, "Low"))), h("label", { class: "proposal-editor-meta-label" }, "Tags", h("input", {
            type: "text",
            class: "proposal-editor-input proposal-editor-input-tags",
            value: t.tags,
            onInput: (e) => onUpdate({ tags: e.target.value }),
            placeholder: "comma-separated tags",
            disabled,
        }))))
        : null);
}
//# sourceMappingURL=proposal-editor.js.map
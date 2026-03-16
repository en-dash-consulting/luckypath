/**
 * Route state management hook for the viewer app.
 *
 * Manages the active view, selected entity IDs (file, zone, run, task),
 * URL history synchronisation, and backward-compat migration of legacy hash URLs.
 */
import { useState, useCallback, useEffect } from "preact/hooks";
import { parseLegacyHashRoute, resolveLocationRoute } from "../route-state.js";
function defaultView(validViews) {
    return validViews.values().next().value;
}
function getInitialView(validViews) {
    const parsed = resolveLocationRoute(location.pathname, location.hash, validViews);
    return parsed?.view ?? defaultView(validViews);
}
function getInitialRunId(validViews) {
    const parsed = resolveLocationRoute(location.pathname, location.hash, validViews);
    if (!parsed || parsed.view !== "hench-runs")
        return null;
    return parsed.subId;
}
function getInitialTaskId(validViews) {
    const parsed = resolveLocationRoute(location.pathname, location.hash, validViews);
    if (!parsed || parsed.view !== "prd")
        return null;
    return parsed.subId;
}
export function useRouteState(validViews) {
    const [view, setView] = useState(() => getInitialView(validViews));
    const [selectedRunId, setSelectedRunId] = useState(() => getInitialRunId(validViews));
    const [selectedTaskId, setSelectedTaskId] = useState(() => getInitialTaskId(validViews));
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedZone, setSelectedZone] = useState(null);
    const navigateTo = useCallback((targetView, opts) => {
        const file = opts?.file ?? null;
        const zone = opts?.zone ?? null;
        const runId = opts?.runId ?? null;
        const taskId = opts?.taskId ?? null;
        setSelectedFile(file);
        setSelectedZone(zone);
        setSelectedRunId(runId);
        setSelectedTaskId(taskId);
        setView(targetView);
        const subId = runId ?? taskId;
        const urlPath = subId ? `/${targetView}/${subId}` : `/${targetView}`;
        history.pushState({ view: targetView, file, zone, runId, taskId }, "", urlPath);
    }, []);
    const handleSidebarNav = useCallback((id) => {
        setSelectedFile(null);
        setSelectedZone(null);
        setSelectedRunId(null);
        setSelectedTaskId(null);
        setView(id);
        history.pushState({ view: id, file: null, zone: null, runId: null, taskId: null }, "", `/${id}`);
    }, []);
    useEffect(() => {
        // Backward compat: migrate old hash URLs to path URLs
        const hashRoute = parseLegacyHashRoute(location.hash, validViews);
        if (hashRoute) {
            const isRunView = hashRoute.view === "hench-runs";
            const isTaskView = hashRoute.view === "prd";
            const runId = isRunView ? hashRoute.subId : null;
            const taskId = isTaskView ? hashRoute.subId : null;
            setView(hashRoute.view);
            setSelectedFile(null);
            setSelectedZone(null);
            setSelectedRunId(runId);
            setSelectedTaskId(taskId);
            const hashUrl = hashRoute.subId ? `/${hashRoute.view}/${hashRoute.subId}` : `/${hashRoute.view}`;
            history.replaceState({ view: hashRoute.view, file: null, zone: null, runId, taskId }, "", hashUrl);
        }
        else {
            // Seed the initial history entry — preserve deep-link path if present
            const subId = selectedRunId ?? selectedTaskId;
            const initialUrl = subId ? `/${view}/${subId}` : `/${view}`;
            history.replaceState({ view, file: selectedFile, zone: selectedZone, runId: selectedRunId, taskId: selectedTaskId }, "", initialUrl);
        }
        const handlePopState = (e) => {
            if (e.state) {
                const s = e.state;
                if (s.view && validViews.has(s.view)) {
                    setView(s.view);
                    setSelectedFile(s.file ?? null);
                    setSelectedZone(s.zone ?? null);
                    setSelectedRunId(s.runId ?? null);
                    setSelectedTaskId(s.taskId ?? null);
                    return;
                }
            }
            const parsed = resolveLocationRoute(location.pathname, location.hash, validViews)
                ?? { view: defaultView(validViews), subId: null };
            setView(parsed.view);
            setSelectedFile(null);
            setSelectedZone(null);
            const isRunView = parsed.view === "hench-runs";
            const isTaskView = parsed.view === "prd";
            setSelectedRunId(isRunView ? parsed.subId : null);
            setSelectedTaskId(isTaskView ? parsed.subId : null);
            const fallbackUrl = parsed.subId ? `/${parsed.view}/${parsed.subId}` : `/${parsed.view}`;
            history.replaceState({
                view: parsed.view,
                file: null,
                zone: null,
                runId: isRunView ? parsed.subId : null,
                taskId: isTaskView ? parsed.subId : null,
            }, "", fallbackUrl);
        };
        window.addEventListener("popstate", handlePopState);
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return { view, selectedFile, setSelectedFile, selectedZone, selectedRunId, selectedTaskId, navigateTo, handleSidebarNav };
}
//# sourceMappingURL=use-route-state.js.map
/**
 * Shared hook + cache for project metadata from `/api/project`.
 *
 * Used by both the sidebar header (project name display) and the
 * breadcrumb component.
 */
import { useState, useEffect } from "preact/hooks";
// ---------------------------------------------------------------------------
// Singleton fetch + cache
// ---------------------------------------------------------------------------
let cachedMeta = null;
let fetchPromise = null;
async function fetchProjectMetadata() {
    try {
        const res = await fetch("/api/project");
        if (!res.ok)
            return null;
        return (await res.json());
    }
    catch {
        return null;
    }
}
/** Fetch with dedup — concurrent calls share one in-flight request. */
export function getProjectMetadata() {
    if (cachedMeta)
        return Promise.resolve(cachedMeta);
    if (!fetchPromise) {
        fetchPromise = fetchProjectMetadata().then((m) => {
            cachedMeta = m;
            fetchPromise = null;
            return m;
        });
    }
    return fetchPromise;
}
/** Return the cached value synchronously (may be null if not yet fetched). */
export function getCachedProjectMetadata() {
    return cachedMeta;
}
// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
/** Preact hook — returns project metadata (fetches once, shares cache). */
export function useProjectMetadata() {
    const [project, setProject] = useState(cachedMeta);
    useEffect(() => {
        getProjectMetadata().then((m) => {
            if (m)
                setProject(m);
        });
    }, []);
    return project;
}
//# sourceMappingURL=use-project-metadata.js.map
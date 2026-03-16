import { getZoneColorByIndex } from "./colors.js";
/** Build a map from file path to zone info (id, name, color). */
export function buildFileToZoneMap(zones) {
    const map = new Map();
    if (zones) {
        zones.zones.forEach((z, i) => {
            const color = getZoneColorByIndex(i);
            for (const f of z.files) {
                map.set(f, { id: z.id, name: z.name, color });
            }
        });
    }
    return map;
}
/** Build aggregated flow edges from zone crossings for FlowDiagram. */
export function buildFlowEdges(crossings) {
    const pairCounts = new Map();
    for (const c of crossings) {
        const key = `${c.fromZone}->${c.toZone}`;
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
    }
    return [...pairCounts.entries()].map(([key, weight]) => {
        const [from, to] = key.split("->");
        return { from, to, weight };
    });
}
/** Build aggregated flow edges from call graph edges for FlowDiagram. */
export function buildCallFlowEdges(edges, fileToZoneMap) {
    const pairCounts = new Map();
    for (const e of edges) {
        if (!e.calleeFile)
            continue;
        const fromZone = fileToZoneMap.get(e.callerFile);
        const toZone = fileToZoneMap.get(e.calleeFile);
        if (!fromZone || !toZone || fromZone.id === toZone.id)
            continue;
        const key = `${fromZone.id}->${toZone.id}`;
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
    }
    return [...pairCounts.entries()].map(([key, weight]) => {
        const [from, to] = key.split("->");
        return { from, to, weight };
    });
}
/**
 * Build cross-zone edges from external package imports.
 *
 * Static call analysis can't resolve cross-package function calls — they appear
 * as external imports (e.g. `import { ... } from "rex"`). This function maps
 * those external package names back to zones and creates weighted edges so the
 * call graph diagram shows inter-package traffic.
 */
export function buildExternalImportEdges(external, fileToZoneMap, zones) {
    // Map package names to zone IDs by finding which zone owns files in that package dir.
    // E.g. "rex" → packages/rex/ → zone whose files start with packages/rex/src/
    // "@n-dx/llm-client" → packages/claude-client/ → claude-client zone
    const pkgToZone = new Map();
    // Build directory prefix → zone mapping from zone file lists.
    // A package may span multiple zones (e.g. sourcevision has "cli" and "tests" zones).
    // We prefer the zone whose files include the package's src/ directory (not tests/).
    const dirToZone = new Map();
    for (const z of zones.zones) {
        for (const f of z.files) {
            const parts = f.split("/");
            if (parts.length >= 2 && parts[0] === "packages") {
                const dir = `packages/${parts[1]}`;
                const isSrc = f.includes("/src/");
                const existing = dirToZone.get(dir);
                if (!existing || (isSrc && !existing.hasSrc)) {
                    dirToZone.set(dir, { zoneId: z.id, hasSrc: isSrc });
                }
            }
        }
    }
    // Known package name → directory mappings for this monorepo
    for (const ext of external) {
        const pkg = ext.package;
        if (pkgToZone.has(pkg))
            continue;
        // Try scoped packages: @n-dx/foo → packages/foo
        if (pkg.startsWith("@n-dx/")) {
            const name = pkg.slice(6); // "claude-client", "web"
            const entry = dirToZone.get(`packages/${name}`);
            if (entry) {
                pkgToZone.set(pkg, entry.zoneId);
                continue;
            }
        }
        // Try unscoped: rex → packages/rex, hench → packages/hench, sourcevision → packages/sourcevision
        const entry = dirToZone.get(`packages/${pkg}`);
        if (entry) {
            pkgToZone.set(pkg, entry.zoneId);
            continue;
        }
    }
    // Build cross-zone edges: for each external import, map importedBy files to their zones
    const pairCounts = new Map();
    for (const ext of external) {
        const targetZone = pkgToZone.get(ext.package);
        if (!targetZone)
            continue;
        for (const file of ext.importedBy) {
            const fromZoneInfo = fileToZoneMap.get(file);
            if (!fromZoneInfo || fromZoneInfo.id === targetZone)
                continue;
            const key = `${fromZoneInfo.id}->${targetZone}`;
            pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
        }
    }
    return [...pairCounts.entries()].map(([key, weight]) => {
        const [from, to] = key.split("->");
        return { from, to, weight };
    });
}
/** Build flow nodes for FlowDiagram from zones. */
export function buildFlowNodes(zones) {
    return zones.zones.map((z, i) => ({
        id: z.id,
        label: z.name,
        color: getZoneColorByIndex(i),
    }));
}
//# sourceMappingURL=flow.js.map
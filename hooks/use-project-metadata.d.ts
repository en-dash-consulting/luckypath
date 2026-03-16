/**
 * Shared hook + cache for project metadata from `/api/project`.
 *
 * Used by both the sidebar header (project name display) and the
 * breadcrumb component.
 */
export interface GitInfo {
    branch: string | null;
    sha: string | null;
    remoteUrl: string | null;
    repoName: string | null;
}
export interface ProjectMetadata {
    name: string;
    description: string | null;
    version: string | null;
    git: GitInfo | null;
    nameSource: "package.json" | "directory";
}
/** Fetch with dedup — concurrent calls share one in-flight request. */
export declare function getProjectMetadata(): Promise<ProjectMetadata | null>;
/** Return the cached value synchronously (may be null if not yet fetched). */
export declare function getCachedProjectMetadata(): ProjectMetadata | null;
/** Preact hook — returns project metadata (fetches once, shares cache). */
export declare function useProjectMetadata(): ProjectMetadata | null;

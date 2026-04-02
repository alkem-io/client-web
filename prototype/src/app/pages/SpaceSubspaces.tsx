import { SpaceSubspacesList } from "@/app/components/space/SpaceSubspacesList";
import { WorkspacesFeed } from "@/app/components/space/WorkspacesFeed";

export function SpaceSubspaces() {
  return (
    <div className="space-y-10">
      <SpaceSubspacesList />
      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--border)",
        }}
      />
      <WorkspacesFeed />
    </div>
  );
}
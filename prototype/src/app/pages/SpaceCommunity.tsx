import { SpaceMembers } from "@/app/components/space/SpaceMembers";
import { CommunityFeed } from "@/app/components/space/CommunityFeed";

export function SpaceCommunity() {
  return (
    <div className="space-y-10">
      <SpaceMembers />
      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--border)",
        }}
      />
      <CommunityFeed />
    </div>
  );
}
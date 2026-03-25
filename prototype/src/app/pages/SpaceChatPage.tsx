import { useParams } from "react-router";
import { SpaceHeader } from "@/app/components/space/SpaceHeader";
import { SpaceSidebar } from "@/app/components/space/SpaceSidebar";
import { SpaceNavigationTabs } from "@/app/components/space/SpaceNavigationTabs";
import { SpaceChatTab } from "@/app/components/messaging/SpaceChatTab";

export function SpaceChatPage() {
  const { spaceSlug } = useParams<{ spaceSlug: string }>();
  const slug = spaceSlug || "default-space";

  return (
    <div
      className="flex flex-col bg-background overflow-hidden"
      style={{
        /* Constrain to viewport minus the MainLayout header (64px) so chat area stays pinned */
        height: "calc(100vh - 64px)",
      }}
    >
      <SpaceHeader spaceSlug={slug} />

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="container mx-auto px-4 md:px-6 pt-6 pb-4 flex-1 flex flex-col min-h-0">
          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
            {/* Sidebar — hidden on mobile, visible on lg+ */}
            <div className="hidden lg:block shrink-0">
              <SpaceSidebar spaceSlug={slug} />
            </div>

            {/* Main content area */}
            <div className="flex-1 w-full min-w-0 flex flex-col min-h-0">
              {/* Tab navigation */}
              <div className="shrink-0 pb-2 mb-0">
                <SpaceNavigationTabs spaceSlug={slug} />
              </div>

              {/* Chat area — fills remaining height */}
              <div
                className="flex-1 flex flex-col min-h-0 rounded-lg overflow-hidden"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                }}
              >
                <SpaceChatTab spaceSlug={slug} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
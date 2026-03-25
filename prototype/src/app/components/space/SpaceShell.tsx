import { useParams, useLocation, Outlet } from "react-router";
import { SpaceHeader } from "./SpaceHeader";
import { SpaceNavigationTabs } from "./SpaceNavigationTabs";
import { SpaceSidebar } from "./SpaceSidebar";

/**
 * SpaceShell wraps the tab pages (Home, Community, Workspaces, Knowledge)
 * with the shared SpaceHeader banner, sidebar, and SpaceNavigationTabs.
 * Settings and Subspace pages render outside this shell.
 */
export function SpaceShell() {
  const { spaceSlug } = useParams<{ spaceSlug: string }>();
  const slug = spaceSlug || "default-space";
  const location = useLocation();

  // Determine sidebar variant from current route
  const getSidebarVariant = () => {
    const path = location.pathname;
    if (path.includes("/community")) return "community";
    if (path.includes("/subspaces")) return "workspaces";
    if (path.includes("/knowledge-base")) return "knowledge";
    return "home";
  };

  return (
    <div className="flex flex-col bg-background">
      <SpaceHeader spaceSlug={slug} />

      {/* Content area: sidebar + tabs/content column */}
      <div
        className="w-full mx-auto py-8"
        style={{ maxWidth: 1536, paddingLeft: 24, paddingRight: 24 }}
      >
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <SpaceSidebar spaceSlug={slug} variant={getSidebarVariant()} />
          <div className="flex-1 w-full min-w-0">
            {/* Tab bar inside content column */}
            <div className="mb-6">
              <SpaceNavigationTabs spaceSlug={slug} />
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

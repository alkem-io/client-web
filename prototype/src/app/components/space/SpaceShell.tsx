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

      {/* Content area: 12-column grid — 1 col margin each side, sidebar 2 cols, content 8 cols */}
      <div className="w-full px-6 md:px-8 py-8">
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="hidden lg:block lg:col-start-2 col-span-2">
            <SpaceSidebar spaceSlug={slug} variant={getSidebarVariant()} />
          </div>
          <div className="col-span-12 lg:col-span-8 min-w-0">
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

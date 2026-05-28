import { useParams, useLocation, useSearchParams, Outlet, Link } from "react-router";
import { SpaceHeader } from "./SpaceHeader";
import { SpaceNavigationTabs } from "./SpaceNavigationTabs";
import { SpaceSidebar } from "./SpaceSidebar";
import { Button } from "@/app/components/ui/button";
import { Plus, UserPlus, Activity, Video, FileText, Share2, Settings } from "lucide-react";

/**
 * SpaceShell wraps the tab pages (Home, Community, Workspaces, Knowledge)
 * with the shared SpaceHeader banner, sidebar, and SpaceNavigationTabs.
 * Settings and Subspace pages render outside this shell.
 */
export function SpaceShell() {
  const { spaceSlug } = useParams<{ spaceSlug: string }>();
  const slug = spaceSlug || "default-space";
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const variant = (parseInt(searchParams.get("v") || "1") || 1) as 1 | 2 | 3 | 4 | 5;

  // Determine sidebar variant from current route
  const getSidebarVariant = () => {
    const path = location.pathname;
    if (path.includes("/community")) return "community";
    if (path.includes("/subspaces")) return "workspaces";
    if (path.includes("/knowledge-base")) return "knowledge";
    return "home";
  };

  // Compact action icons shown in the tab bar
  const actionIcons = (
    <div className="flex items-center gap-0.5">
      {[
        { icon: Activity, title: "Recent Activity" },
        { icon: Video, title: "Video Call" },
        { icon: FileText, title: "Documents" },
        { icon: Share2, title: "Share" },
      ].map(({ icon: Icon, title }) => (
        <button
          key={title}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{
            background: "color-mix(in srgb, var(--foreground) 8%, transparent)",
            color: "var(--muted-foreground)",
          }}
          title={title}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
      <Link to={`/space/${slug}/settings`}>
        <button
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{
            background: "color-mix(in srgb, var(--foreground) 8%, transparent)",
            color: "var(--muted-foreground)",
          }}
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </Link>
    </div>
  );

  // Route-aware action buttons for the sticky tab bar
  const getActionButtons = () => {
    const path = location.pathname;
    if (path.includes("/community")) {
      return (
        <div className="flex items-center gap-2">
          {actionIcons}
          <Button variant="outline" size="sm" className="shrink-0 gap-2">
            <UserPlus className="w-4 h-4" />
            Invite
          </Button>
          <Button size="sm" className="shrink-0 gap-2">
            <Plus className="w-4 h-4" />
            Add Post
          </Button>
        </div>
      );
    }
    if (path.includes("/subspaces")) {
      return (
        <div className="flex items-center gap-2">
          {actionIcons}
          <Button variant="outline" size="sm" className="shrink-0 gap-2">
            <Plus className="w-4 h-4" />
            Create Subspace
          </Button>
          <Button size="sm" className="shrink-0 gap-2">
            <Plus className="w-4 h-4" />
            Add Post
          </Button>
        </div>
      );
    }
    // Home & Knowledge Base both use Add Post
    return (
      <div className="flex items-center gap-2">
        {actionIcons}
        <Button size="sm" className="shrink-0 gap-2">
          <Plus className="w-4 h-4" />
          Add Post
        </Button>
      </div>
    );
  };

  // V2+ use a max-width container so content scales into margins on zoom
  const usesScaling = variant !== 1;
  const scaledContainer = { maxWidth: 1536, margin: "0 auto", width: "100%" };

  return (
    <div className="flex flex-col bg-background">
      <SpaceHeader spaceSlug={slug} variant={variant} />

      {/* Content area */}
      <div className="w-full px-4 pt-0 pb-8" style={!usesScaling ? { paddingLeft: 32, paddingRight: 32 } : undefined}>
        <div style={usesScaling ? scaledContainer : undefined}>
          <div className="grid grid-cols-12 gap-6 items-start">
            <div className={`hidden lg:block col-span-2 sticky top-24 self-start ${!usesScaling ? "lg:col-start-2" : ""}`}>
              <SpaceSidebar spaceSlug={slug} variant={getSidebarVariant()} />
            </div>
            <div className={`col-span-12 ${usesScaling ? "lg:col-span-10" : "lg:col-span-8"} min-w-0`}>
              {/* Sticky tab bar */}
              <div
                className="sticky top-16 z-10 pt-4 pb-3 mb-4"
                style={{
                  background:
                    "color-mix(in srgb, var(--background) 95%, transparent)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  paddingLeft: 10,
                  paddingRight: 10,
                  marginLeft: -10,
                  marginRight: -10,
                }}
              >
                <SpaceNavigationTabs spaceSlug={slug} actionButton={getActionButtons()} />
              </div>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback } from "react";
import { useParams, useLocation, useSearchParams, Outlet, Link } from "react-router";
import { SpaceHeader } from "./SpaceHeader";
import { SpaceNavigationTabs } from "./SpaceNavigationTabs";
import { SpaceSidebar } from "./SpaceSidebar";
import { FilterProvider } from "./FilterContext";
import { Activity, Video, FileText, Share2, Settings } from "lucide-react";
import { AboutThisSpaceDialog } from "./AboutThisSpaceDialog";

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
  const [activeTabDescription, setActiveTabDescription] = useState("Activity and updates from members of this space.");
  const [aboutOpen, setAboutOpen] = useState(false);

  const handleActiveTabChange = useCallback((description: string) => {
    setActiveTabDescription(description);
  }, []);

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
      ].map(({ icon: Icon, title, onClick }) => (
        <button
          key={title}
          onClick={onClick}
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

  // Action toolbar — icon buttons only; primary CTAs live in the left panel
  const getActionButtons = () => actionIcons;

  // V2+ use a max-width container so content scales into margins on zoom
  const usesScaling = variant !== 1;
  const scaledContainer = { maxWidth: 1536, margin: "0 auto", width: "100%" };

  return (
    <FilterProvider>
      <div className="flex flex-col bg-background">
        <SpaceHeader spaceSlug={slug} variant={variant} onInfoClick={() => setAboutOpen(true)} />

        {/* Content area */}
        <div className="w-full px-4 pt-0 pb-8" style={!usesScaling ? { paddingLeft: 32, paddingRight: 32 } : undefined}>
          <div style={usesScaling ? scaledContainer : undefined}>
            <div className="grid grid-cols-12 gap-6 items-start">
              {/* Sticky tab bar — full-width across both panels, parent of the layout below */}
              <div
                className={`col-span-12 ${!usesScaling ? "lg:col-start-2 lg:col-span-10" : ""} sticky top-16 z-10 pt-4 pb-0`}
                style={{
                  background:
                    "color-mix(in srgb, var(--background) 95%, transparent)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                <SpaceNavigationTabs spaceSlug={slug} actionButton={getActionButtons()} onActiveTabChange={handleActiveTabChange} />
              </div>

              {/* Left panel — scoped to the active tab */}
              <div className={`hidden lg:block col-span-2 sticky top-[8.5rem] self-start ${!usesScaling ? "lg:col-start-2" : ""}`}>
                <aside>
                  <SpaceSidebar spaceSlug={slug} variant={getSidebarVariant()} activeTabDescription={activeTabDescription} />
                </aside>
              </div>

              {/* Right panel — pure content */}
              <div className={`col-span-12 ${usesScaling ? "lg:col-span-10" : "lg:col-span-8"} min-w-0`}>
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
      <AboutThisSpaceDialog open={aboutOpen} onOpenChange={setAboutOpen} spaceSlug={slug} />
    </FilterProvider>
  );
}

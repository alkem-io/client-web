import { useParams, Link, useLocation, Navigate } from "react-router";
import { SpaceHeader } from "@/app/components/space/SpaceHeader";
import { SpaceSettingsAbout } from "@/app/components/space/SpaceSettingsAbout";
import { SpaceSettingsLayout } from "@/app/components/space/SpaceSettingsLayout";
import { SpaceSettingsCommunity } from "@/app/components/space/SpaceSettingsCommunity";
import { SpaceSettingsSubspaces } from "@/app/components/space/SpaceSettingsSubspaces";
import { SpaceSettingsTemplates } from "@/app/components/space/SpaceSettingsTemplates";
import { SpaceSettingsStorage } from "@/app/components/space/SpaceSettingsStorage";
import { SpaceSettingsSettings } from "@/app/components/space/SpaceSettingsSettings";
import { SpaceSettingsAccount } from "@/app/components/space/SpaceSettingsAccount";
import { Info, Layout, Users, Layers, FileText, HardDrive, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple slug-to-name mapping (shared with SpaceLayout)
function slugToName(slug: string): string {
  const map: Record<string, string> = {
    "green-energy": "Green Energy Space",
    "sustainability-lab": "Sustainability Lab",
    "urban-mobility": "Urban Mobility Lab",
    "community-garden": "Community Garden",
  };
  return (
    map[slug] ||
    slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function SpaceSettingsPage() {
  const { spaceSlug, tab } = useParams<{ spaceSlug: string; tab: string }>();
  const location = useLocation();
  const spaceName = spaceSlug ? slugToName(spaceSlug) : "Space";

  // If no tab is provided, redirect to 'about'
  if (!tab && location.pathname.endsWith("/settings")) {
    return <Navigate to={`/space/${spaceSlug}/settings/about`} replace />;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      {/* Space Banner — same component as the space itself */}
      <SpaceHeader spaceSlug={spaceSlug || "default-space"} />

      {/* Horizontal Tab Navigation */}
      <div
        className="w-full overflow-x-auto shrink-0 sticky top-16 z-10"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <nav
          className="flex items-center gap-0 px-6"
          style={{
            minHeight: 44,
            fontFamily: "var(--font-family, 'Inter', sans-serif)",
          }}
        >
          {[
            { label: "About", icon: Info, id: "about" },
            { label: "Layout", icon: Layout, id: "layout" },
            { label: "Community", icon: Users, id: "community" },
            { label: "Subspaces", icon: Layers, id: "subspaces" },
            { label: "Templates", icon: FileText, id: "templates" },
            { label: "Storage", icon: HardDrive, id: "storage" },
            { label: "Settings", icon: Settings, id: "settings" },
            { label: "Account", icon: User, id: "account" },
          ].map((item) => {
            const isActive = tab === item.id;
            return (
              <Link
                key={item.id}
                to={`/space/${spaceSlug}/settings/${item.id}`}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 whitespace-nowrap transition-colors relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {/* Active indicator line */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-4 right-4"
                    style={{
                      height: 2,
                      background: "var(--primary)",
                      borderRadius: "1px 1px 0 0",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area — full width, no sidebar */}
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Content Rendered based on Tab */}
          <div
            className="w-full min-h-[500px] p-6 md:p-8 shadow-sm"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            {tab === 'about' ? (
              <SpaceSettingsAbout />
            ) : tab === 'layout' ? (
              <SpaceSettingsLayout />
            ) : tab === 'community' ? (
              <SpaceSettingsCommunity />
            ) : tab === 'subspaces' ? (
              <SpaceSettingsSubspaces />
            ) : tab === 'templates' ? (
              <SpaceSettingsTemplates />
            ) : tab === 'storage' ? (
              <SpaceSettingsStorage />
            ) : tab === 'settings' ? (
              <SpaceSettingsSettings />
            ) : tab === 'account' ? (
              <SpaceSettingsAccount />
            ) : (
              <div className="flex flex-col justify-center h-full min-h-[300px] space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--muted)" }}>
                  <div className="w-8 h-8 rounded-md" style={{ background: "color-mix(in srgb, var(--muted-foreground) 20%, transparent)" }} />
                </div>
                <div>
                  <h2
                    className="capitalize"
                    style={{
                      fontSize: "var(--text-xl)",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      fontFamily: "var(--font-family, 'Inter', sans-serif)",
                    }}
                  >
                    {tab} Settings
                  </h2>
                  <p
                    className="max-w-sm"
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--muted-foreground)",
                      lineHeight: 1.6,
                      marginTop: "var(--spacing-2, 8px)",
                    }}
                  >
                    This section is under development. Please check back later for {tab} configuration options.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
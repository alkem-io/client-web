import { useParams, Link, useLocation, Navigate } from "react-router";
import { SpaceSettingsAbout } from "@/app/components/space/SpaceSettingsAbout";
import { SpaceSettingsLayout } from "@/app/components/space/SpaceSettingsLayout";
import { SpaceSettingsCommunity } from "@/app/components/space/SpaceSettingsCommunity";
import { SpaceSettingsUpdates } from "@/app/components/space/SpaceSettingsUpdates";
import { SpaceSettingsSubspaces } from "@/app/components/space/SpaceSettingsSubspaces";
import { SpaceSettingsTemplates } from "@/app/components/space/SpaceSettingsTemplates";
import { SpaceSettingsStorage } from "@/app/components/space/SpaceSettingsStorage";
import { SpaceSettingsSettings } from "@/app/components/space/SpaceSettingsSettings";
import { SpaceSettingsAccount } from "@/app/components/space/SpaceSettingsAccount";
import { Info, Layout, Users, Megaphone, Layers, FileText, HardDrive, Settings, User, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpaceData {
  name: string;
  initials: string;
  avatarColor: string;
  bannerImage: string;
  description: string;
}

const SPACE_DATA: Record<string, SpaceData> = {
  "green-energy": { name: "Green Energy Space", initials: "GE", avatarColor: "#2563eb", bannerImage: "https://images.unsplash.com/photo-1690191863988-f685cddde463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBjaGFsbGVuZ2UlMjBjcmVhdGl2ZSUyMHdvcmtzaG9wJTIwdGVhbSUyMGNvbGxhYm9yYXRpb24lMjBpbm5vdmF0aW9uJTIwc3ByaW50JTIwZGVzaWduJTIwc3ByaW50fGVufDF8fHx8MTc2OTA5NDMxMHww&ixlib=rb-4.1.0&q=80&w=400", description: "Accelerating the transition to sustainable energy systems worldwide." },
  "sustainability-lab": { name: "Sustainability Lab", initials: "SL", avatarColor: "#16a34a", bannerImage: "https://images.unsplash.com/photo-1623652554515-91c833e3080e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsYWJvcmF0aW9uJTIwdGVhbXdvcmslMjBpbm5vdmF0aW9uJTIwZGVzaWduJTIwdGhpbmtpbmclMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NjkwODc1ODd8MA&ixlib=rb-4.1.0&q=80&w=400", description: "Experimenting with innovative approaches to environmental sustainability." },
  "urban-mobility": { name: "Urban Mobility Lab", initials: "UM", avatarColor: "#0891b2", bannerImage: "https://images.unsplash.com/photo-1735639013995-086e648eaa38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFpbnN0b3JtaW5nJTIwY3JlYXRpdmUlMjB3b3Jrc2hvcCUyMHRlYW18ZW58MXx8fHwxNzY5MDg3NTg3fDA&ixlib=rb-4.1.0&q=80&w=400", description: "Reimagining city transportation for better accessibility and lower emissions." },
  "community-garden": { name: "Community Garden", initials: "CG", avatarColor: "#65a30d", bannerImage: "https://images.unsplash.com/photo-1768659347532-74d3b1efb0ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBtZWV0aW5nJTIwY29sbGFib3JhdGlvbiUyMHRlYW18ZW58MXx8fHwxNzY5MDg3NTg3fDA&ixlib=rb-4.1.0&q=80&w=400", description: "Growing food and community connections in urban neighborhoods." },
  "innovation-lab": { name: "Innovation Lab", initials: "IL", avatarColor: "#7c3aed", bannerImage: "https://images.unsplash.com/photo-1676276376052-dc9c9c0b6917?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbm5vdmF0aW9uJTIwbGFiJTIwdGVhbXdvcmslMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MXx8fHwxNzY5MDg3NTg2fDA&ixlib=rb-4.1.0&q=80&w=400", description: "A collaborative space for breakthrough ideas and rapid experimentation." },
};

function getSpaceData(slug: string): SpaceData {
  return SPACE_DATA[slug] || {
    name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    initials: slug.substring(0, 2).toUpperCase(),
    avatarColor: "#64748b",
    bannerImage: "",
    description: "A collaborative space for innovation.",
  };
}

export function SpaceSettingsPage() {
  const { spaceSlug, tab } = useParams<{ spaceSlug: string; tab: string }>();
  const location = useLocation();
  const space = spaceSlug ? getSpaceData(spaceSlug) : getSpaceData("");

  // If no tab is provided, redirect to 'about'
  if (!tab && location.pathname.endsWith("/settings")) {
    return <Navigate to={`/space/${spaceSlug}/settings/about`} replace />;
  }

  const tabs = [
    { label: "About", icon: Info, id: "about" },
    { label: "Layout", icon: Layout, id: "layout" },
    { label: "Community", icon: Users, id: "community" },
    { label: "Updates", icon: Megaphone, id: "updates" },
    { label: "Subspaces", icon: Layers, id: "subspaces" },
    { label: "Templates", icon: Lightbulb, id: "templates" },
    { label: "Storage", icon: HardDrive, id: "storage" },
    { label: "Settings", icon: Settings, id: "settings" },
    { label: "Account", icon: User, id: "account" },
  ];

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Sticky header with title + tabs */}
      <div className="sticky top-16 z-20 border-b border-border bg-card">
        <div className="px-6 md:px-8 pt-8 pb-0">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10">
              <div className="flex items-center gap-4 mb-8">
                {space.bannerImage ? (
                  <div
                    className="w-12 h-12 rounded-full shrink-0 overflow-hidden"
                    style={{ border: "2px solid var(--border)" }}
                  >
                    <img src={space.bannerImage} alt={space.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: space.avatarColor }}
                  >
                    {space.initials}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{space.name}</h1>
                  <p className="text-muted-foreground text-sm mt-0.5">{space.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                {tabs.map((item) => {
                  const isActive = tab === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={`/space/${spaceSlug}/settings/${item.id}`}
                      className={cn(
                        "flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                        isActive
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="px-6 md:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10">
        <div>
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
            ) : tab === 'updates' ? (
              <SpaceSettingsUpdates />
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
          </div>
        </div>
      </main>
    </div>
  );
}
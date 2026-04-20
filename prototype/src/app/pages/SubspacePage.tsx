import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { Plus, Layout } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Button } from "@/app/components/ui/button";
import { SubspaceHeader } from "@/app/components/space/SubspaceHeader";
import { SubspaceSidebar } from "@/app/components/space/SubspaceSidebar";
import { CalloutTabs, type CalloutTab } from "@/app/components/space/ChannelTabs";
import { PostCard, type PostProps } from "@/app/components/space/PostCard";
import { AddPostModal } from "@/app/components/space/AddPostModal";
import { SubspaceCommunityDialog } from "@/app/components/space/SubspaceCommunityDialog";

/* ─── Mock subspace metadata ─── */

// Parent space banner — subspaces always inherit their parent's banner
const PARENT_SPACE_BANNER =
  "https://images.unsplash.com/photo-1690191863988-f685cddde463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBjaGFsbGVuZ2UlMjBjcmVhdGl2ZSUyMHdvcmtzaG9wJTIwdGVhbSUyMGNvbGxhYm9yYXRpb24lMjBpbm5vdmF0aW9uJTIwc3ByaW50JTIwZGVzaWduJTIwc3ByaW50fGVufDF8fHx8MTc2OTA5NDMxMHww&ixlib=rb-4.1.0&q=80&w=1080";

interface SubspaceInfo {
  title: string;
  description: string;
  parentName: string;
  initials: string;
  avatarColor: string;
  avatarImage?: string;
  parentInitials: string;
  parentAvatarColor: string;
  memberCount: number;
  callouts: CalloutTab[];
}

const SUBSPACE_MAP: Record<string, SubspaceInfo> = {
  "renewable-energy-transition": {
    title: "Renewable Energy Transition",
    description:
      "Developing strategies for municipal energy transition to 100% renewables by 2030.",
    parentName: "Green Energy Space",
    initials: "RE",
    avatarColor: "#22c55e",
    avatarImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    parentInitials: "GE",
    parentAvatarColor: "#2563eb",
    memberCount: 24,
    callouts: [
      { id: "strategy", label: "Strategy Docs", description: "Core strategy documents and roadmaps for the 2030 transition.", count: 5, linkedToNext: true },
      { id: "municipal", label: "Municipal Data", description: "Data sets and reports from participating municipalities.", linkedToNext: true },
      { id: "policy", label: "Policy Drafts", description: "Draft policy frameworks and regulatory proposals.", count: 2, linkedToNext: false },
      { id: "stakeholders", label: "Stakeholders", description: "Stakeholder mapping, contacts, and engagement plans.", linkedToNext: false },
    ],
  },
  "urban-mobility-lab": {
    title: "Urban Mobility Lab",
    description:
      "Reimagining city transportation networks for better accessibility and reduced carbon footprint.",
    parentName: "Green Energy Space",
    initials: "UM",
    avatarColor: "#0891b2",
    avatarImage: "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    parentInitials: "GE",
    parentAvatarColor: "#2563eb",
    memberCount: 18,
    callouts: [
      { id: "research", label: "Research", description: "Studies and literature on urban mobility patterns.", count: 3, linkedToNext: true },
      { id: "prototypes", label: "Prototypes", description: "Prototype designs and pilot programme documentation.", linkedToNext: false },
      { id: "field-tests", label: "Field Tests", description: "On-the-ground testing results and feedback.", count: 1, linkedToNext: false },
    ],
  },
  "green-infrastructure": {
    title: "Green Infrastructure",
    description:
      "Planning and implementation of urban green spaces, vertical gardens, and sustainable drainage.",
    parentName: "Green Energy Space",
    initials: "GI",
    avatarColor: "#16a34a",
    avatarImage: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    parentInitials: "GE",
    parentAvatarColor: "#2563eb",
    memberCount: 12,
    callouts: [
      { id: "planning", label: "Planning", description: "Urban green space planning documents and proposals.", count: 4, linkedToNext: true },
      { id: "implementation", label: "Implementation", description: "Progress updates and implementation guides.", linkedToNext: false },
    ],
  },
};

// Fallback for unrecognized slugs
const DEFAULT_SUBSPACE: SubspaceInfo = {
  title: "Subspace",
  description: "A focused collaboration area.",
  parentName: "Space",
  initials: "SS",
  avatarColor: "#64748b",
  parentInitials: "SP",
  parentAvatarColor: "#475569",
  memberCount: 10,
  callouts: [
    { id: "general", label: "General", description: "General discussions and shared content." },
  ],
};

/* ─── Mock posts with callout tags ─── */
const wb1 =
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1080";
const wb2 =
  "https://images.unsplash.com/photo-1574359219611-a3031f074b2c?auto=format&fit=crop&q=80&w=1080";

interface CalloutPost extends PostProps {
  callout: string; // matches a callout id
}

const SUBSPACE_POSTS: CalloutPost[] = [
  {
    id: "sp-1",
    type: "text",
    callout: "strategy",
    author: {
      name: "Sarah Chen",
      role: "Lead",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Kickoff: Municipal Transition Strategy",
    snippet:
      "We are officially launching the strategy phase for the 2030 renewable transition. Our goal is to outline a clear path for municipalities to reach 100% renewable energy.",
    timestamp: "2 hours ago",
    stats: { comments: 5 },
  },
  {
    id: "sp-2",
    type: "whiteboard",
    callout: "strategy",
    author: {
      name: "David Kim",
      role: "Member",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Renewable Grid Architecture — Visual Mapping",
    snippet:
      "Interactive whiteboard exploring the interconnections between solar, wind and storage for the 2030 grid model.",
    timestamp: "5 hours ago",
    contentPreview: { imageUrl: wb1 },
    stats: { comments: 3 },
  },
  {
    id: "sp-3",
    type: "text",
    callout: "policy",
    author: {
      name: "Emily Davis",
      role: "Lead",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Draft: Incentive Framework for Early Adopters",
    snippet:
      "Sharing the first draft of the municipal incentive framework. Please review Section 3 on tax credits and provide feedback by Friday.",
    timestamp: "1 day ago",
    stats: { comments: 8 },
  },
  {
    id: "sp-4",
    type: "call-for-whiteboards",
    callout: "municipal",
    author: {
      name: "Alex Torres",
      role: "Member",
      avatarUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Call for Ideas: Community Solar Projects",
    snippet:
      "We need ideas on how to best involve communities in shared solar projects. Submit your whiteboard proposals below.",
    timestamp: "2 days ago",
    contentPreview: {
      whiteboards: [
        {
          title: "Community Solar Model A",
          imageUrl: wb1,
          author: "Sarah Chen",
        },
        {
          title: "Rooftop Sharing Plan",
          imageUrl: wb2,
          author: "David Kim",
        },
      ],
    },
    stats: { comments: 12 },
  },
  {
    id: "sp-5",
    type: "collection",
    callout: "stakeholders",
    author: {
      name: "Anna Martinez",
      role: "Lead",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Stakeholder Contact Directory",
    snippet:
      "Compiled directory of all stakeholders across municipal, industry, and NGO sectors involved in the transition programme.",
    timestamp: "3 days ago",
    contentPreview: {
      items: [
        { title: "Municipality Contacts", type: "spreadsheet" },
        { title: "Industry Partners", type: "document" },
        { title: "NGO Directory", type: "document" },
      ],
    },
    stats: { comments: 2 },
  },
  {
    id: "sp-6",
    type: "text",
    callout: "policy",
    author: {
      name: "Robert Fox",
      role: "Member",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    title: "Comparative Analysis: EU Renewable Directives",
    snippet:
      "A comparative study of EU member-state approaches to the Renewable Energy Directive (RED III) and implications for our municipal framework.",
    timestamp: "4 days ago",
    stats: { comments: 4 },
  },
];

/* ─── Page Component ─── */
export default function SubspacePage() {
  const {
    spaceSlug = "green-energy",
    subspaceSlug = "renewable-energy-transition",
  } = useParams();
  const navigate = useNavigate();

  const info = SUBSPACE_MAP[subspaceSlug] || {
    ...DEFAULT_SUBSPACE,
    title: subspaceSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  };

  const [activeCallout, setActiveCallout] = useState(info.callouts[0]?.id ?? "");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCommunityDialogOpen, setIsCommunityDialogOpen] = useState(false);

  // Filter posts by active phase
  const filteredPosts = useMemo(
    () => SUBSPACE_POSTS.filter((p) => p.callout === activeCallout),
    [activeCallout]
  );

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{ fontFamily: "var(--font-family, 'Inter', sans-serif)" }}
    >
      {/* ── Subspace Banner Header ── */}
      <SubspaceHeader
        spaceSlug={spaceSlug}
        subspaceSlug={subspaceSlug}
        title={info.title}
        description={info.description}
        parentSpaceName={info.parentName}
        imageUrl={PARENT_SPACE_BANNER}
        initials={info.initials}
        avatarColor={info.avatarColor}
        avatarImage={info.avatarImage}
        parentInitials={info.parentInitials}
        parentAvatarColor={info.parentAvatarColor}
        parentBannerImage={PARENT_SPACE_BANNER}
        memberCount={info.memberCount}
        onCommunityClick={() => setIsCommunityDialogOpen(true)}
      />

      {/* ── Main Content Area ── */}
      <main className="flex-1 w-full px-6 md:px-8 py-8">
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Sidebar — col 2-3 (2 columns, 1 col margin left) */}
          <div
            className="lg:col-start-2 col-span-2 hidden lg:block sticky top-24 self-start"
          >
            <SubspaceSidebar
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() =>
                setIsSidebarCollapsed(!isSidebarCollapsed)
              }
            />
          </div>

          {/* Right Content: Channels + Feed — 8 columns */}
          <div className="col-span-12 lg:col-span-8 min-w-0">
          {/* Sticky channel tabs bar */}
          <div
            className="sticky top-16 z-10 pt-4 pb-3 mb-4 -mx-4 px-4 md:mx-0 md:px-0"
            style={{
              background:
                "color-mix(in srgb, var(--background) 95%, transparent)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() =>
                        navigate(
                          `/space/${spaceSlug}/subspaces/${subspaceSlug}/settings/layout`
                        )
                      }
                      className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Edit innovation flow"
                    >
                      <Layout className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Edit innovation flow</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <CalloutTabs
                tabs={info.callouts}
                activeTab={activeCallout}
                onTabChange={setActiveCallout}
              />
              <Button
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => setIsPostModalOpen(true)}
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)" as any,
                }}
              >
                <Plus className="w-4 h-4" />
                Add Post
              </Button>
            </div>
          </div>

          {/* Tab description */}
          {info.callouts.find((c) => c.id === activeCallout)?.description && (
            <p
              className="mb-4"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--muted-foreground)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {info.callouts.find((c) => c.id === activeCallout)?.description}
            </p>
          )}

          {/* Feed */}
          <div className="space-y-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                />
              ))
            ) : (
              <div
                className="flex flex-col items-center justify-center py-16"
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: "var(--radius)",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--text-lg)",
                    fontWeight: 500,
                    color: "var(--foreground)",
                    marginBottom: 4,
                  }}
                >
                  No posts in this phase yet
                </p>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Be the first to share something here.
                </p>
              </div>
            )}
          </div>
          </div>
        </div>
      </main>

      {/* Add Post Modal */}
      <AddPostModal
        open={isPostModalOpen}
        onOpenChange={setIsPostModalOpen}
      />

      {/* Community Dialog */}
      <SubspaceCommunityDialog
        open={isCommunityDialogOpen}
        onOpenChange={setIsCommunityDialogOpen}
      />
    </div>
  );
}
import { useState, useMemo } from "react";
import { useParams } from "react-router";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { SubspaceHeader } from "@/app/components/space/SubspaceHeader";
import { SubspaceSidebar } from "@/app/components/space/SubspaceSidebar";
import { CalloutTabs, type CalloutTab } from "@/app/components/space/ChannelTabs";
import { PostCard, type PostProps } from "@/app/components/space/PostCard";
import { AddPostModal } from "@/app/components/space/AddPostModal";

/* ─── Mock subspace metadata ─── */
interface SubspaceInfo {
  title: string;
  description: string;
  parentName: string;
  bannerImage: string;
  memberCount: number;
  callouts: CalloutTab[];
}

const SUBSPACE_MAP: Record<string, SubspaceInfo> = {
  "renewable-energy-transition": {
    title: "Renewable Energy Transition",
    description:
      "Developing strategies for municipal energy transition to 100% renewables by 2030.",
    parentName: "Green Energy Space",
    bannerImage:
      "https://images.unsplash.com/photo-1665813122461-2fcb38ece4b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZW5ld2FibGUlMjBlbmVyZ3klMjB3aW5kJTIwdHVyYmluZXMlMjBzdW5zZXR8ZW58MXx8fHwxNzcyNDQ2MTM5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    memberCount: 24,
    callouts: [
      { id: "all", label: "ALL ACTIVITY" },
      { id: "strategy", label: "STRATEGY DOCS", count: 5 },
      { id: "municipal", label: "MUNICIPAL DATA" },
      { id: "policy", label: "POLICY DRAFTS", count: 2 },
      { id: "stakeholders", label: "STAKEHOLDERS" },
    ],
  },
  "urban-mobility-lab": {
    title: "Urban Mobility Lab",
    description:
      "Reimagining city transportation networks for better accessibility and reduced carbon footprint.",
    parentName: "Green Energy Space",
    bannerImage:
      "https://images.unsplash.com/photo-1743385779313-ac03bb0f997b?auto=format&fit=crop&w=1080&q=80",
    memberCount: 18,
    callouts: [
      { id: "all", label: "ALL ACTIVITY" },
      { id: "research", label: "RESEARCH", count: 3 },
      { id: "prototypes", label: "PROTOTYPES" },
      { id: "field-tests", label: "FIELD TESTS", count: 1 },
    ],
  },
  "green-infrastructure": {
    title: "Green Infrastructure",
    description:
      "Planning and implementation of urban green spaces, vertical gardens, and sustainable drainage.",
    parentName: "Green Energy Space",
    bannerImage:
      "https://images.unsplash.com/photo-1760611656007-f767a8082758?auto=format&fit=crop&w=1080&q=80",
    memberCount: 12,
    callouts: [
      { id: "all", label: "ALL ACTIVITY" },
      { id: "planning", label: "PLANNING", count: 4 },
      { id: "implementation", label: "IMPLEMENTATION" },
    ],
  },
};

// Fallback for unrecognized slugs
const DEFAULT_SUBSPACE: SubspaceInfo = {
  title: "Subspace",
  description: "A focused collaboration area.",
  parentName: "Space",
  bannerImage:
    "https://images.unsplash.com/photo-1550483428-9facac419319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  memberCount: 10,
  callouts: [
    { id: "all", label: "ALL ACTIVITY" },
    { id: "general", label: "GENERAL" },
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

  const [activeCallout, setActiveCallout] = useState("all");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const info = SUBSPACE_MAP[subspaceSlug] || {
    ...DEFAULT_SUBSPACE,
    title: subspaceSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  };

  // Filter posts by callout
  const filteredPosts = useMemo(
    () =>
      activeCallout === "all"
        ? SUBSPACE_POSTS
        : SUBSPACE_POSTS.filter((p) => p.callout === activeCallout),
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
        imageUrl={info.bannerImage}
        memberCount={info.memberCount}
      />

      {/* ── Main Content Area ── */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 flex gap-8 relative items-start">
        {/* Left Sidebar (collapsible) */}
        <div
          className={`shrink-0 transition-all duration-300 ${
            isSidebarCollapsed ? "w-12" : "w-80"
          } hidden md:block sticky top-24 self-start`}
        >
          <SubspaceSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() =>
              setIsSidebarCollapsed(!isSidebarCollapsed)
            }
          />
        </div>

        {/* Right Content: Channels + Feed */}
        <div className="flex-1 min-w-0">
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

          {/* Feed */}
          <div className="max-w-3xl space-y-6">
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
                  No posts in this callout yet
                </p>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Be the first to share something here.
                </p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => setActiveCallout("all")}
                >
                  Show all activity
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Post Modal */}
      <AddPostModal
        open={isPostModalOpen}
        onOpenChange={setIsPostModalOpen}
      />
    </div>
  );
}
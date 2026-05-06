import { useState } from "react";
import { useParams } from "react-router";
import { Plus, Folder } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { SpaceCard, type SpaceCardData } from "@/app/components/space/SpaceCard";
import { cn } from "@/lib/utils";

// Subspace avatar colors
const SUBSPACE_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
];

// Parent space banner for avatar derivation
const PARENT_BANNER = "https://images.unsplash.com/photo-1690191863988-f685cddde463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400";

// Mock Data — mapped to SpaceCardData format
const SUBSPACES: (SpaceCardData & { status: string })[] = [
  {
    id: "sub-1",
    slug: "renewable-energy-transition",
    name: "Renewable Energy Transition",
    description: "Developing strategies for municipal energy transition to 100% renewables by 2030.",
    bannerImage: "https://images.unsplash.com/photo-1677506048377-1099738d294d?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1509391366360-2e959784a276?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    initials: "RE",
    avatarColor: SUBSPACE_COLORS[0],
    isPrivate: false,
    tags: ["Energy", "Strategy", "2030"],
    memberCount: 24,
    status: "Active",
    leads: [
      { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", type: "person" },
      { name: "Green Future Org", avatar: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80", type: "org" },
    ],
  },
  {
    id: "sub-2",
    slug: "urban-mobility-lab",
    name: "Urban Mobility Lab",
    description: "Reimagining city transportation networks for better accessibility and reduced carbon footprint.",
    bannerImage: "https://images.unsplash.com/photo-1743385779313-ac03bb0f997b?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    initials: "UM",
    avatarColor: SUBSPACE_COLORS[1],
    isPrivate: false,
    tags: ["Transport", "Accessibility"],
    memberCount: 18,
    status: "Active",
    leads: [
      { name: "David Kim", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", type: "person" },
    ],
  },
  {
    id: "sub-3",
    slug: "green-infrastructure",
    name: "Green Infrastructure",
    description: "Planning and implementation of urban green spaces, vertical gardens, and sustainable drainage.",
    bannerImage: "https://images.unsplash.com/photo-1760611656007-f767a8082758?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    initials: "GI",
    avatarColor: SUBSPACE_COLORS[2],
    isPrivate: false,
    tags: ["Urban", "Green Spaces", "Drainage"],
    memberCount: 12,
    status: "Active",
    leads: [
      { name: "Emily Davis", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", type: "person" },
      { name: "City Planning Dept", avatar: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80", type: "org" },
      { name: "James Wilson", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", type: "person" },
    ],
  },
  {
    id: "sub-4",
    slug: "policy-frameworks",
    name: "Policy Frameworks",
    description: "Drafting policy recommendations and regulatory frameworks to support sustainability initiatives.",
    bannerImage: "https://images.unsplash.com/photo-1769069918751-9cdb7c752fcc?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1554103210-26d928978fb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    initials: "PF",
    avatarColor: SUBSPACE_COLORS[3],
    isPrivate: true,
    tags: ["Policy", "Regulation"],
    memberCount: 8,
    status: "Archived",
    leads: [
      { name: "Policy Institute", avatar: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80", type: "org" },
    ],
  },
  {
    id: "sub-5",
    slug: "community-engagement",
    name: "Community Engagement",
    description: "Tools and methodologies for involving local communities in decision-making processes.",
    bannerImage: "https://images.unsplash.com/photo-1554103210-26d928978fb5?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    initials: "CE",
    avatarColor: SUBSPACE_COLORS[4],
    isPrivate: false,
    tags: ["Community", "Participation"],
    memberCount: 32,
    status: "Active",
    leads: [
      { name: "Anna Martinez", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", type: "person" },
      { name: "Local Council", avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80", type: "org" },
    ],
  },
  {
    id: "sub-6",
    slug: "digital-twin-project",
    name: "Digital Twin Project",
    description: "Creating digital replicas of urban systems to simulate and optimize performance.",
    bannerImage: "https://images.unsplash.com/photo-1683818051102-dd1199d163b9?auto=format&fit=crop&w=800&q=80",
    avatar: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    initials: "DT",
    avatarColor: SUBSPACE_COLORS[5],
    isPrivate: false,
    tags: ["Digital", "Simulation"],
    memberCount: 15,
    status: "Active",
    leads: [
      { name: "Tech Innovations", avatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80", type: "org" },
      { name: "Robert Fox", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", type: "person" },
    ],
  },
];

export function SpaceSubspacesList() {
  const { spaceSlug } = useParams<{ spaceSlug: string }>();
  const slug = spaceSlug || "default-space";
  const [filter, setFilter] = useState("All");

  // Attach parent info so SpaceCard can build the correct subspace link
  const subspacesWithParent = SUBSPACES.map((s) => ({
    ...s,
    parent: {
      name: slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      slug,
      bannerImage: PARENT_BANNER,
      initials: slug.substring(0, 2).toUpperCase(),
      avatarColor: "#2563eb",
    },
  }));

  const filteredSubspaces =
    filter === "All"
      ? subspacesWithParent
      : subspacesWithParent.filter((s) => s.status === filter);

  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--muted-foreground)",
          }}
        >
          Explore focused workstreams and challenges within this space.
        </p>
        <Button className="shrink-0 gap-2">
          <Plus className="w-4 h-4" />
          Create Subspace
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {["All", "Active", "Archived"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-3 py-1.5 rounded-full transition-colors",
              filter === status
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              border: `1px solid ${filter === status ? "var(--primary)" : "var(--border)"}`,
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Card Grid — uses the shared SpaceCard component */}
      {filteredSubspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubspaces.map((subspace) => (
            <SpaceCard
              key={subspace.id}
              space={subspace}
            />
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-16"
          style={{
            border: "2px dashed var(--border)",
            borderRadius: "var(--radius)",
          }}
        >
          <Folder
            className="mb-3"
            style={{
              width: 40,
              height: 40,
              color: "var(--muted-foreground)",
              opacity: 0.5,
            }}
          />
          <h3
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: 500,
              color: "var(--foreground)",
            }}
          >
            No subspaces found
          </h3>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--muted-foreground)",
            }}
          >
            No subspaces match your current filter.
          </p>
          <Button
            variant="link"
            onClick={() => setFilter("All")}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
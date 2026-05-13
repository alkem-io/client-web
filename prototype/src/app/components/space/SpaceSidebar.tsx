import { useState } from "react";
import { ReadMoreText } from "@/app/components/ui/ReadMoreText";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  ChevronRight,
  ChevronDown,
  Info,
  Settings,
  Plus,
  MapPin,
  Mail,
  Bot,
  BookOpen,
  ShieldCheck,
  FileText,
  FolderOpen,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { AboutThisSpaceDialog } from "@/app/components/space/AboutThisSpaceDialog";

interface SpaceSidebarProps {
  spaceSlug: string;
  /** Controls which sections render below the info block */
  variant?: "home" | "community" | "workspaces" | "knowledge";
}

const SUBSPACE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
];

const SUBSPACES = [
  { name: "Renewable Energy", initials: "RE" },
  { name: "Urban Planning", initials: "UP" },
  { name: "Transportation", initials: "TR" },
];

const VIRTUAL_CONTRIBUTORS = [
  {
    name: "Sustainability Advisor",
    description: "AI assistant trained on sustainability frameworks and best practices.",
    initials: "SA",
    avatar: "https://images.unsplash.com/photo-1641312874336-6279a832a3dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2JvdCUyMEFJJTIwYXNzaXN0YW50JTIwYXZhdGFyJTIwZnV0dXJpc3RpY3xlbnwxfHx8fDE3NzIxMDQyMjl8MA&ixlib=rb-4.1.0&q=80&w=256",
  },
  {
    name: "Policy Researcher",
    description: "Specialises in regulatory and policy analysis for urban environments.",
    initials: "PR",
    avatar: "https://images.unsplash.com/photo-1770233621425-5d9ee7a0a700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwZGlnaXRhbCUyMGJyYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzIxMDQyMzB8MA&ixlib=rb-4.1.0&q=80&w=256",
  },
];

const COMMUNITY_GUIDELINES = [
  "Be respectful and constructive in all discussions.",
  "Share knowledge openly and credit original sources.",
  "Stay on topic within each subspace and thread.",
  "Protect the privacy of community members.",
];

export function SpaceSidebar({ spaceSlug, variant = "home" }: SpaceSidebarProps) {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div
      className="space-y-6 w-full"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Info Block (shared across all variants) ── */}
      <InfoBlock onAboutClick={() => setAboutOpen(true)} />
      <AboutThisSpaceDialog open={aboutOpen} onOpenChange={setAboutOpen} spaceSlug={spaceSlug} />

      {/* ── Community Members ── */}
      <CommunityMembersWidget />

      {/* ── Variant-specific content ── */}
      {(variant === "home" || variant === "knowledge") && (
        <>
          {/* Subspaces List */}
          {variant === "home" && <SubspacesSection spaceSlug={spaceSlug} />}
          {variant === "knowledge" && <KnowledgeIndexSection />}

          {/* Events Section */}
          <EventsSection />
        </>
      )}

      {variant === "community" && (
        <>
          {/* Contact Lead */}
          <Button
            variant="outline"
            className="w-full gap-2"
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)" as any,
            }}
          >
            <Mail className="w-4 h-4" />
            Contact Lead
          </Button>

          {/* Virtual Contributors */}
          <VirtualContributorsSection />

          {/* Community Guidelines */}
          <CommunityGuidelinesSection />
        </>
      )}

      {variant === "workspaces" && (
        <>
          {/* Full subspaces list */}
          <SubspacesSection spaceSlug={spaceSlug} showAll />
        </>
      )}
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function InfoBlock({ onAboutClick }: { onAboutClick: () => void }) {
  return (
    <div
      className="p-5"
      style={{
        background: "var(--primary)",
        color: "var(--primary-foreground)",
        borderRadius: "var(--radius)",
      }}
    >
      <div className="mb-3">
        <ReadMoreText
          maxLines={3}
          style={{
            fontSize: "var(--text-sm)",
            lineHeight: 1.6,
            opacity: 0.9,
          }}
          toggleColor="var(--primary-foreground)"
          toggleOpacity={0.8}
        >
          Collaborating on the future of sustainable energy solutions and urban
          transformation. Join our community of innovators working to solve
          real-world challenges.
        </ReadMoreText>
      </div>

      {/* Space Lead */}
      <div
        className="pt-3 mt-1"
        style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
      >
        <p
          className="uppercase tracking-wider mb-2"
          style={{
            fontSize: "10px",
            fontWeight: 700,
            opacity: 0.6,
            letterSpacing: "0.04em",
          }}
        >
          Lead
        </p>
        <div className="flex items-center gap-3">
          <Avatar
            className="w-8 h-8"
            style={{ border: "2px solid rgba(255,255,255,0.25)" }}
          >
            <AvatarImage
              src="https://images.unsplash.com/photo-1623853589874-864b1dd4d922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdsYXNzZXMlMjBibGFjayUyMGFuZCUyMHdoaXRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256"
              alt="Elena Martinez"
            />
            <AvatarFallback
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "white",
                fontSize: "9px",
                fontWeight: 700,
              }}
            >
              EM
            </AvatarFallback>
          </Avatar>
          <div>
            <p style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>
              Elena Martinez
            </p>
            <p
              className="flex items-center gap-1"
              style={{ fontSize: "11px", opacity: 0.7 }}
            >
              <MapPin className="w-3 h-3" />
              Amsterdam, NL
            </p>
          </div>
        </div>
      </div>

      {/* About this Space */}
      <button
        onClick={onAboutClick}
        className="w-full flex items-center justify-center gap-2 pt-3 mt-3 hover:underline cursor-pointer"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.15)",
          fontSize: "var(--text-sm)",
          fontWeight: "var(--font-weight-medium)" as any,
          color: "var(--primary-foreground)",
          opacity: 0.8,
          background: "none",
          border: "none",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "rgba(255,255,255,0.15)",
          padding: 0,
          paddingTop: "12px",
          marginTop: "12px",
        }}
      >
        <Info className="w-3.5 h-3.5" />
        About this Space
      </button>
    </div>
  );
}

function VirtualContributorsSection() {
  return (
    <div
      className="p-4"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-3">
        <Bot
          className="w-3.5 h-3.5"
          style={{ color: "var(--muted-foreground)" }}
        />
        <h3
          className="uppercase tracking-wider"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--muted-foreground)",
          }}
        >
          Virtual Contributors
        </h3>
      </div>
      <div className="space-y-2">
        {VIRTUAL_CONTRIBUTORS.map((vc) => (
          <div
            key={vc.name}
            className="flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage src={vc.avatar} alt={vc.name} />
              <AvatarFallback
                style={{
                  background:
                    "color-mix(in srgb, var(--info) 15%, transparent)",
                  color: "var(--info)",
                  fontSize: "9px",
                  fontWeight: 700,
                }}
              >
                {vc.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "var(--foreground)",
                }}
              >
                {vc.name}
              </p>
              <p
                className="line-clamp-2"
                style={{
                  fontSize: "12px",
                  color: "var(--muted-foreground)",
                  lineHeight: 1.4,
                  marginTop: 2,
                }}
              >
                {vc.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityGuidelinesSection() {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <BookOpen
          className="w-3.5 h-3.5"
          style={{ color: "var(--muted-foreground)" }}
        />
        <h3
          className="uppercase tracking-wider"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--muted-foreground)",
          }}
        >
          Community Guidelines
        </h3>
      </div>
      <ul className="space-y-2.5 px-1">
        {COMMUNITY_GUIDELINES.map((guideline, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <ShieldCheck
              className="w-3.5 h-3.5 shrink-0 mt-0.5"
              style={{ color: "var(--success)" }}
            />
            <span
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--muted-foreground)",
                lineHeight: 1.5,
              }}
            >
              {guideline}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SubspacesSectionProps {
  spaceSlug: string;
  showAll?: boolean;
}

function SubspacesSection({ spaceSlug, showAll }: SubspacesSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3
          className="uppercase tracking-wider"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--muted-foreground)",
          }}
        >
          Subspaces
        </h3>
        <div className="flex items-center gap-1">
          {!showAll && (
            <Link
              to={`/space/${spaceSlug}/subspaces`}
              className="hover:underline"
              style={{
                fontSize: "12px",
                color: "var(--primary)",
                fontWeight: "var(--font-weight-medium)" as any,
              }}
            >
              Show all
            </Link>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Settings className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        {SUBSPACES.map((subspace, index) => (
          <Link
            key={subspace.name}
            to={`/space/${spaceSlug}/subspaces/${subspace.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-7 h-7">
                <AvatarFallback
                  style={{
                    background: `color-mix(in srgb, ${SUBSPACE_COLORS[index % SUBSPACE_COLORS.length]} 15%, transparent)`,
                    color:
                      SUBSPACE_COLORS[index % SUBSPACE_COLORS.length],
                    fontSize: "9px",
                    fontWeight: 700,
                  }}
                >
                  {subspace.initials}
                </AvatarFallback>
              </Avatar>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "var(--foreground)",
                }}
              >
                {subspace.name}
              </span>
            </div>
            <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function EventsSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <h3
            className="uppercase tracking-wider"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--muted-foreground)",
            }}
          >
            Events
          </h3>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full"
          style={{
            background:
              "color-mix(in srgb, var(--primary) 10%, transparent)",
            color: "var(--primary)",
          }}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <p
        className="px-3"
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--muted-foreground)",
        }}
      >
        No upcoming events
      </p>
      <button
        className="px-3 mt-2 hover:underline"
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: "var(--font-weight-medium)" as any,
          color: "var(--primary)",
        }}
      >
        Show calendar
      </button>
    </div>
  );
}

const COMMUNITY_MEMBERS = [
  { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80", initials: "SC" },
  { name: "David Kim", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80", initials: "DK" },
  { name: "Emily Davis", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80", initials: "ED" },
  { name: "Marc Johnson", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=128", initials: "MJ" },
  { name: "Lisa Wang", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80", initials: "LW" },
  { name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80", initials: "AR" },
];

function CommunityMembersWidget() {
  const totalMembers = 29;
  return (
    <div
      className="p-4"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
          <h3
            className="uppercase tracking-wider"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--muted-foreground)",
            }}
          >
            Community
          </h3>
        </div>
        <span
          style={{
            fontSize: "11px",
            color: "var(--muted-foreground)",
          }}
        >
          {totalMembers} members
        </span>
      </div>
      <div className="flex -space-x-2 mb-3">
        {COMMUNITY_MEMBERS.map((m) => (
          <Avatar
            key={m.initials}
            className="w-8 h-8 transition-transform hover:z-10 hover:scale-110"
            style={{ border: "2px solid var(--card)" }}
          >
            <AvatarImage src={m.avatar} alt={m.name} />
            <AvatarFallback
              style={{
                background: "color-mix(in srgb, var(--primary) 15%, transparent)",
                color: "var(--primary)",
                fontSize: "10px",
                fontWeight: 600,
              }}
            >
              {m.initials}
            </AvatarFallback>
          </Avatar>
        ))}
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-colors"
          style={{
            background: "color-mix(in srgb, var(--primary) 10%, transparent)",
            color: "var(--primary)",
            fontSize: "11px",
            fontWeight: 600,
            border: "2px solid var(--card)",
          }}
        >
          +{totalMembers - COMMUNITY_MEMBERS.length}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5"
        style={{ fontSize: "var(--text-sm)" }}
      >
        <Users className="w-3.5 h-3.5" />
        View all members
      </Button>
    </div>
  );
}

function KnowledgeIndexSection() {
  const KB_INDEX = [
    { id: "kb-1", title: "Transition Case Studies & Policy Docs", type: "collection" as const },
    { id: "kb-2", title: "Q1 Sustainability Report & Supporting Data", type: "collection" as const },
    { id: "kb-3", title: "Community Workshop Guidelines", type: "text" as const },
    { id: "kb-4", title: "Grid Modernisation Reference Materials", type: "collection" as const },
    { id: "kb-5", title: "Funding Opportunities for Municipal Energy Projects", type: "text" as const },
    { id: "kb-6", title: "Stakeholder Meeting Notes & Action Items", type: "collection" as const },
  ];

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <FolderOpen
          className="w-3.5 h-3.5"
          style={{ color: "var(--muted-foreground)" }}
        />
        <h3
          className="uppercase tracking-wider"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--muted-foreground)",
          }}
        >
          Post Index
        </h3>
      </div>
      <div className="space-y-0.5">
        {KB_INDEX.map((entry) => (
          <button
            key={entry.id}
            className="group flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
            onClick={() => {
              const el = document.getElementById(entry.id);
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <FileText
              className="w-3.5 h-3.5 shrink-0"
              style={{
                color:
                  entry.type === "collection"
                    ? "var(--chart-2)"
                    : "var(--muted-foreground)",
              }}
            />
            <span
              className="line-clamp-1"
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-medium)" as any,
                color: "var(--foreground)",
              }}
            >
              {entry.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
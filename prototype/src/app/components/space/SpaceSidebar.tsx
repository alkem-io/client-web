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
  UserPlus,
  Bot,
  BookOpen,
  ShieldCheck,
  FileText,
  FolderOpen,
} from "lucide-react";
import { Link } from "react-router";

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
  return (
    <div
      className="space-y-6 w-full"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Info Block (shared across all variants) ── */}
      <InfoBlock />

      {/* ── Variant-specific content ── */}
      {(variant === "home" || variant === "knowledge") && (
        <>
          {/* About this Space button */}
          <Button
            variant="outline"
            className="w-full uppercase tracking-wider gap-2"
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)" as any,
            }}
          >
            <Info className="w-4 h-4" />
            About this Space
          </Button>

          {/* Subspaces List */}
          {variant === "home" && <SubspacesSection spaceSlug={spaceSlug} />}
          {variant === "knowledge" && <KnowledgeIndexSection />}

          {/* Events Section */}
          <EventsSection />
        </>
      )}

      {variant === "community" && (
        <>
          {/* Lead block */}
          <LeadBlock />

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-medium)" as any,
              }}
            >
              <Mail className="w-4 h-4" />
              Contact Lead
            </Button>
            <Button
              className="flex-1 gap-2"
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-medium)" as any,
              }}
            >
              <UserPlus className="w-4 h-4" />
              Invite
            </Button>
          </div>

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

function InfoBlock() {
  return (
    <div
      className="p-5"
      style={{
        background: "var(--primary)",
        color: "var(--primary-foreground)",
        borderRadius: "var(--radius)",
      }}
    >
      <p
        className="mb-3"
        style={{
          fontSize: "var(--text-sm)",
          lineHeight: 1.6,
          opacity: 0.9,
        }}
      >
        Collaborating on the future of sustainable energy solutions and urban
        transformation. Join our community of innovators working to solve
        real-world challenges.
      </p>
      <button
        className="hover:underline"
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: "var(--font-weight-medium)" as any,
          color: "var(--primary-foreground)",
          opacity: 0.8,
        }}
      >
        Read more
      </button>
    </div>
  );
}

function LeadBlock() {
  return (
    <div
      className="p-4"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <p
        className="uppercase tracking-wider mb-3"
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--muted-foreground)",
        }}
      >
        Space Lead
      </p>
      <div className="flex items-center gap-3">
        <Avatar
          className="w-10 h-10"
          style={{ border: "2px solid var(--border)" }}
        >
          <AvatarImage
            src="https://images.unsplash.com/photo-1623853589874-864b1dd4d922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdsYXNzZXMlMjBibGFjayUyMGFuZCUyMHdoaXRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256"
            alt="Elena Martinez"
          />
          <AvatarFallback
            style={{
              background: "color-mix(in srgb, var(--primary) 15%, transparent)",
              color: "var(--primary)",
              fontSize: "10px",
              fontWeight: 700,
            }}
          >
            EM
          </AvatarFallback>
        </Avatar>
        <div>
          <p
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--foreground)",
            }}
          >
            Elena Martinez
          </p>
          <p
            className="flex items-center gap-1"
            style={{
              fontSize: "12px",
              color: "var(--muted-foreground)",
            }}
          >
            <MapPin className="w-3 h-3" /> Amsterdam, NL
          </p>
        </div>
      </div>
      <p
        className="mt-3"
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--muted-foreground)",
          lineHeight: 1.5,
        }}
      >
        Community Host. Driving sustainable innovation in urban planning.
      </p>
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
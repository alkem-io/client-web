import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { SpaceCard, type SpaceCardData } from "@/app/components/space/SpaceCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Separator } from "@/app/components/ui/separator";
import {
  Info,
  ChevronLeft,
  Activity,
  CalendarDays,
  List,
  Layers,
  MapPin,
  Bot,
  ExternalLink,
  Clock,
  MessageSquare,
  FileText,
  Users,
  Plus,
  Folder,
} from "lucide-react";
import { SubspaceCommunityDialog } from "@/app/components/space/SubspaceCommunityDialog";
import { cn } from "@/lib/utils";

interface SubspaceSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

const SUBSPACE_LEAD = {
  name: "David Kim",
  location: "Berlin, DE",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  initials: "DK",
};

const VIRTUAL_CONTRIBUTOR = {
  name: "Design Advisor",
  description: "AI assistant trained on design thinking and collaboration frameworks.",
  avatar:
    "https://images.unsplash.com/photo-1641312874336-6279a832a3dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=256",
};

const SUB_SUBSPACES: (SpaceCardData & { status: string })[] = [
  {
    id: "ss-1",
    slug: "solar-panel-deployment",
    name: "Solar Panel Deployment",
    description: "Planning and rollout of residential solar panel installations across participating municipalities.",
    bannerImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    initials: "SP",
    avatarColor: "#f59e0b",
    isPrivate: false,
    tags: ["Solar", "Deployment"],
    memberCount: 8,
    status: "Active",
    leads: [
      { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", type: "person" },
    ],
    parent: { name: "Renewable Energy Transition", slug: "renewable-energy-transition", initials: "RE", avatarColor: "#22c55e" },
  },
  {
    id: "ss-2",
    slug: "wind-farm-feasibility",
    name: "Wind Farm Feasibility",
    description: "Feasibility studies for offshore and onshore wind projects in the northern corridor.",
    bannerImage: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=800&q=80",
    initials: "WF",
    avatarColor: "#0ea5e9",
    isPrivate: false,
    tags: ["Wind", "Feasibility"],
    memberCount: 6,
    status: "Active",
    leads: [
      { name: "David Kim", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", type: "person" },
    ],
    parent: { name: "Renewable Energy Transition", slug: "renewable-energy-transition", initials: "RE", avatarColor: "#22c55e" },
  },
  {
    id: "ss-3",
    slug: "battery-storage-research",
    name: "Battery Storage Research",
    description: "Research on grid-scale battery storage solutions and next-gen energy storage tech.",
    bannerImage: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=800&q=80",
    initials: "BS",
    avatarColor: "#8b5cf6",
    isPrivate: false,
    tags: ["Battery", "Research"],
    memberCount: 5,
    status: "Active",
    leads: [
      { name: "Emily Davis", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", type: "person" },
      { name: "Tech Innovations", avatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80", type: "org" },
    ],
    parent: { name: "Renewable Energy Transition", slug: "renewable-energy-transition", initials: "RE", avatarColor: "#22c55e" },
  },
];

export function SubspaceSidebar({
  isCollapsed,
  onToggleCollapse,
  className,
}: SubspaceSidebarProps) {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const challengeRef = useRef<HTMLParagraphElement>(null);
  const [isChallengesTruncated, setIsChallengesTruncated] = useState(false);

  useEffect(() => {
    const el = challengeRef.current;
    if (el) {
      setIsChallengesTruncated(el.scrollHeight > el.clientHeight);
    }
  }, []);

  return (
    <div
      className={cn(
        "relative transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-12" : "w-full",
        className
      )}
      style={{ fontFamily: "var(--font-family, 'Inter', sans-serif)" }}
    >
      {/* Collapse toggle — positioned on the right edge */}
      <button
        onClick={onToggleCollapse}
        className={cn(
          "absolute -right-3 top-0 z-20 hidden md:flex items-center justify-center w-6 h-6 rounded-full transition-transform",
          isCollapsed && "rotate-180"
        )}
        style={{
          background: "var(--background)",
          border: "1px solid var(--border)",
          boxShadow: "var(--elevation-sm)",
          color: "var(--muted-foreground)",
        }}
      >
        <ChevronLeft className="w-3 h-3" />
      </button>

      {/* Sidebar content — hidden when collapsed */}
      <div
        className={cn(
          "flex flex-col gap-6 overflow-hidden transition-opacity duration-200",
          isCollapsed
            ? "opacity-0 invisible pointer-events-none"
            : "opacity-100 visible"
        )}
      >
        {/* ── Challenge Statement ── */}
        <div
          className="p-5"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            borderRadius: "var(--radius)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4" style={{ opacity: 0.8 }} />
            <span
              className="uppercase tracking-wider"
              style={{
                fontSize: "11px",
                fontWeight: 700,
                opacity: 0.8,
              }}
            >
              Challenge Statement
            </span>
          </div>
          <p
            ref={challengeRef}
            className="line-clamp-4"
            style={{
              fontSize: "var(--text-sm)",
              lineHeight: 1.6,
              opacity: 0.92,
            }}
          >
            How might we design a collaborative platform that empowers
            distributed teams to innovate effectively while maintaining social
            connection?
          </p>
          {isChallengesTruncated && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-4 gap-2"
              onClick={() => setOpenDialog("activity")}
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-medium)" as any,
                background:
                  "color-mix(in srgb, var(--primary-foreground) 15%, transparent)",
                color: "var(--primary-foreground)",
                border: "none",
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Read Full Brief
            </Button>
          )}

          {/* Subspace Lead */}
          <div
            className="pt-3 mt-3"
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
                <AvatarImage src={SUBSPACE_LEAD.avatar} alt={SUBSPACE_LEAD.name} />
                <AvatarFallback
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontSize: "9px",
                    fontWeight: 700,
                  }}
                >
                  {SUBSPACE_LEAD.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>
                  {SUBSPACE_LEAD.name}
                </p>
                <p
                  className="flex items-center gap-1"
                  style={{ fontSize: "11px", opacity: 0.7 }}
                >
                  <MapPin className="w-3 h-3" />
                  {SUBSPACE_LEAD.location}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <p
            className="uppercase tracking-wider mb-3 px-1"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--muted-foreground)",
            }}
          >
            Quick Actions
          </p>
          <div className="space-y-1">
            {[
              { icon: Activity, label: "Recent Activity", key: "activity" },
              { icon: Users, label: "Community", key: "community" },
              { icon: CalendarDays, label: "Events", key: "events" },
              { icon: List, label: "Index", key: "index" },
              { icon: Layers, label: "Subspaces", key: "subspaces" },
            ].map(({ icon: Icon, label, key }) => (
              <button
                key={key}
                onClick={() => setOpenDialog(key)}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-md transition-colors hover:bg-muted/50"
                style={{
                  background:
                    "color-mix(in srgb, var(--secondary) 30%, transparent)",
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--primary)" }}
                />
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: "var(--font-weight-medium)" as any,
                    color: "var(--foreground)",
                  }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Virtual Contributor ── */}
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
            <p
              className="uppercase tracking-wider"
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--muted-foreground)",
              }}
            >
              Virtual Contributor
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage
                src={VIRTUAL_CONTRIBUTOR.avatar}
                alt={VIRTUAL_CONTRIBUTOR.name}
              />
              <AvatarFallback
                style={{
                  background:
                    "color-mix(in srgb, var(--info) 15%, transparent)",
                  color: "var(--info)",
                  fontSize: "9px",
                  fontWeight: 700,
                }}
              >
                DA
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
                {VIRTUAL_CONTRIBUTOR.name}
              </p>
              <p
                className="line-clamp-2 mt-0.5"
                style={{
                  fontSize: "12px",
                  color: "var(--muted-foreground)",
                  lineHeight: 1.4,
                }}
              >
                {VIRTUAL_CONTRIBUTOR.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Action Dialogs ── */}

      {/* Community Dialog */}
      <SubspaceCommunityDialog
        open={openDialog === "community"}
        onOpenChange={(open) => setOpenDialog(open ? "community" : null)}
      />

      {/* Recent Activity Dialog */}
      <Dialog open={openDialog === "activity"} onOpenChange={(open) => setOpenDialog(open ? "activity" : null)}>
        <DialogContent
          className="max-w-none sm:max-w-none max-h-[85vh] overflow-y-auto"
          style={{ width: 'calc((100vw - 2 * var(--grid-margin-desktop) - 11 * var(--grid-gutter)) / var(--grid-columns) * 6 + 5 * var(--grid-gutter))' }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" style={{ color: "var(--primary)" }} />
              Recent Activity
            </DialogTitle>
            <DialogDescription>Latest updates and contributions in this subspace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {[
              { user: "Sarah Chen", action: "posted", target: "Kickoff: Municipal Transition Strategy", time: "2 hours ago", icon: FileText },
              { user: "David Kim", action: "added a whiteboard to", target: "Renewable Grid Architecture", time: "5 hours ago", icon: FileText },
              { user: "Emily Davis", action: "commented on", target: "Draft: Incentive Framework", time: "1 day ago", icon: MessageSquare },
              { user: "Alex Torres", action: "created", target: "Call for Ideas: Community Solar", time: "2 days ago", icon: FileText },
              { user: "Anna Martinez", action: "updated", target: "Stakeholder Contact Directory", time: "3 days ago", icon: FileText },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md" style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)" }}>
                    <item.icon className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--foreground)" }}>
                      <span style={{ fontWeight: 600 }}>{item.user}</span>{" "}
                      <span style={{ color: "var(--muted-foreground)" }}>{item.action}</span>{" "}
                      <span style={{ fontWeight: 500 }}>{item.target}</span>
                    </p>
                    <p className="flex items-center gap-1 mt-0.5" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </p>
                  </div>
                </div>
                {i < 4 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Events Dialog */}
      <Dialog open={openDialog === "events"} onOpenChange={(open) => setOpenDialog(open ? "events" : null)}>
        <DialogContent
          className="max-w-none sm:max-w-none max-h-[85vh] overflow-y-auto"
          style={{ width: 'calc((100vw - 2 * var(--grid-margin-desktop) - 11 * var(--grid-gutter)) / var(--grid-columns) * 6 + 5 * var(--grid-gutter))' }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" style={{ color: "var(--primary)" }} />
              Events
            </DialogTitle>
            <DialogDescription>Upcoming and past events for this subspace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {[
              { title: "Strategy Workshop", date: "Apr 25, 2026", time: "10:00 – 12:00 CET", status: "upcoming", attendees: 14 },
              { title: "Stakeholder Review Meeting", date: "Apr 28, 2026", time: "14:00 – 15:30 CET", status: "upcoming", attendees: 8 },
              { title: "Policy Framework Feedback Session", date: "May 2, 2026", time: "09:00 – 11:00 CET", status: "upcoming", attendees: 22 },
              { title: "Community Solar Ideation Sprint", date: "Apr 15, 2026", time: "13:00 – 17:00 CET", status: "past", attendees: 18 },
              { title: "Monthly Progress Sync", date: "Apr 10, 2026", time: "11:00 – 12:00 CET", status: "past", attendees: 12 },
            ].map((event, i) => (
              <div
                key={i}
                className="p-3 rounded-lg"
                style={{
                  border: "1px solid var(--border)",
                  background: event.status === "upcoming" ? "var(--card)" : "var(--muted)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--foreground)" }}>{event.title}</p>
                    <p className="mt-1 flex items-center gap-1.5" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                      <CalendarDays className="w-3 h-3" />
                      {event.date} · {event.time}
                    </p>
                  </div>
                  <span
                    className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{
                      background: event.status === "upcoming"
                        ? "color-mix(in srgb, var(--primary) 12%, transparent)"
                        : "color-mix(in srgb, var(--muted-foreground) 12%, transparent)",
                      color: event.status === "upcoming" ? "var(--primary)" : "var(--muted-foreground)",
                    }}
                  >
                    {event.status === "upcoming" ? "Upcoming" : "Past"}
                  </span>
                </div>
                <p className="mt-1.5 flex items-center gap-1" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                  <Users className="w-3 h-3" />
                  {event.attendees} attendees
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Index Dialog */}
      <Dialog open={openDialog === "index"} onOpenChange={(open) => setOpenDialog(open ? "index" : null)}>
        <DialogContent
          className="max-w-none sm:max-w-none max-h-[85vh] overflow-y-auto"
          style={{ width: 'calc((100vw - 2 * var(--grid-margin-desktop) - 11 * var(--grid-gutter)) / var(--grid-columns) * 6 + 5 * var(--grid-gutter))' }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <List className="w-5 h-5" style={{ color: "var(--primary)" }} />
              Index
            </DialogTitle>
            <DialogDescription>All posts and content organized in this subspace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1 mt-2">
            {[
              { title: "Kickoff: Municipal Transition Strategy", type: "Post", channel: "Strategy Docs", author: "Sarah Chen" },
              { title: "Renewable Grid Architecture — Visual Mapping", type: "Whiteboard", channel: "Strategy Docs", author: "David Kim" },
              { title: "Draft: Incentive Framework for Early Adopters", type: "Post", channel: "Policy Drafts", author: "Emily Davis" },
              { title: "Call for Ideas: Community Solar Projects", type: "Call for Whiteboards", channel: "Municipal Data", author: "Alex Torres" },
              { title: "Stakeholder Contact Directory", type: "Collection", channel: "Stakeholders", author: "Anna Martinez" },
              { title: "Comparative Analysis: EU Renewable Directives", type: "Post", channel: "Policy Drafts", author: "Robert Fox" },
            ].map((item, i) => (
              <button
                key={i}
                className="flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-md transition-colors hover:bg-muted/50"
              >
                <FileText className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--primary)" }} />
                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--foreground)" }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                    {item.type} · {item.channel} · {item.author}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Subspaces Dialog */}
      <Dialog open={openDialog === "subspaces"} onOpenChange={(open) => setOpenDialog(open ? "subspaces" : null)}>
        <DialogContent
          className="max-w-none sm:max-w-none max-h-[85vh] overflow-y-auto"
          style={{ width: 'calc((100vw - 2 * var(--grid-margin-desktop) - 11 * var(--grid-gutter)) / var(--grid-columns) * 6 + 5 * var(--grid-gutter))' }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" style={{ color: "var(--primary)" }} />
              Subspaces
            </DialogTitle>
            <DialogDescription>Explore focused workstreams and challenges within this subspace.</DialogDescription>
          </DialogHeader>

          {/* Header row with filter + create */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              {["All", "Active", "Archived"].map((status) => (
                <button
                  key={status}
                  className={cn(
                    "px-3 py-1.5 rounded-full transition-colors",
                    status === "All"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 500,
                    border: `1px solid ${status === "All" ? "var(--primary)" : "var(--border)"}`,
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
            <Button size="sm" className="shrink-0 gap-2">
              <Plus className="w-4 h-4" />
              Create Subspace
            </Button>
          </div>

          {/* Card Grid — mirrors SpaceSubspacesList layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {(SUB_SUBSPACES as (SpaceCardData & { status: string })[]).map((subspace) => (
              <SpaceCard
                key={subspace.id}
                space={subspace}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

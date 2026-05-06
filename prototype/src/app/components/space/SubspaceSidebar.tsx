import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  Info,
  ChevronLeft,
  FileText,
  Users,
  Calendar,
  MapPin,
  Bot,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubspaceSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

const FACILITATOR = {
  name: "Sarah Chen",
  role: "Facilitator",
  location: "Amsterdam, NL",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

const VIRTUAL_CONTRIBUTOR = {
  name: "Design Advisor",
  description: "AI assistant trained on design thinking and collaboration frameworks.",
  avatar:
    "https://images.unsplash.com/photo-1641312874336-6279a832a3dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=256",
};

export function SubspaceSidebar({
  isCollapsed,
  onToggleCollapse,
  className,
}: SubspaceSidebarProps) {
  return (
    <div
      className={cn(
        "relative transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-12" : "w-full md:w-80",
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
          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-4 gap-2"
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
        </div>

        {/* ── Facilitator ── */}
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
            Facilitator
          </p>
          <div className="flex items-center gap-3">
            <Avatar
              className="w-10 h-10"
              style={{ border: "2px solid var(--border)" }}
            >
              <AvatarImage src={FACILITATOR.avatar} alt={FACILITATOR.name} />
              <AvatarFallback
                style={{
                  background:
                    "color-mix(in srgb, var(--primary) 15%, transparent)",
                  color: "var(--primary)",
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                SC
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
                {FACILITATOR.name}
              </p>
              <p
                className="flex items-center gap-1"
                style={{
                  fontSize: "12px",
                  color: "var(--muted-foreground)",
                }}
              >
                <MapPin className="w-3 h-3" />
                {FACILITATOR.location}
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
            {FACILITATOR.role} · Leading collaboration and workshop facilitation.
          </p>
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
              { icon: FileText, label: "Project Docs" },
              { icon: Users, label: "Team Roster" },
              { icon: Calendar, label: "Schedule" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
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

        {/* ── About this Subspace ── */}
        <div
          className="p-4"
          style={{
            background: "var(--muted)",
            borderRadius: "var(--radius)",
          }}
        >
          <p
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)" as any,
              color: "var(--foreground)",
              marginBottom: 4,
            }}
          >
            About this Subspace
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "var(--muted-foreground)",
              lineHeight: 1.5,
            }}
          >
            Created on Jan 12, 2024 by Sarah Chen. Part of the Green Energy Space space.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 gap-2"
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)" as any,
            }}
          >
            <Info className="w-3.5 h-3.5" />
            More Info
          </Button>
        </div>
      </div>
    </div>
  );
}

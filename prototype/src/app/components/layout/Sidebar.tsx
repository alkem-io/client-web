import { useState } from "react";
import {
  Rocket,
  Mail,
  Eye,
  Lightbulb,
  Tag,
  ChevronsLeft,
  ChevronsRight,
  Bot,
  LayoutTemplate,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Switch } from "@/app/components/ui/switch";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { InvitationsDialog } from "@/app/components/dialogs/InvitationsDialog";
import { CreateSpaceDialog } from "@/app/components/dialogs/CreateSpaceDialog";
import AlkemioLogo from "@/imports/AlkemioLogo";
import AlkemioSymbolSquare from "@/imports/AlkemioSymbolSquare";
import { useLanguage } from "@/app/contexts/LanguageContext";

export function Sidebar({ className }: { className?: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navItems: Array<{
    icon: React.ElementType;
    label: string;
    href?: string;
    onClick?: () => void;
    badge?: number;
  }> = [
    {
      icon: Mail,
      label: t("nav.invitations"),
      onClick: () => setShowInvitations(true),
      badge: 2,
    },
    { icon: Rocket, label: "Create my own Space", onClick: () => setShowCreateSpace(true) },
    { icon: Lightbulb, label: "Tips & Tricks", href: "#" },
    { icon: LayoutTemplate, label: "Template Library", href: "/templates" },
    { icon: Tag, label: "My Account", href: "/user/alex-rivera/settings/account" },
  ];

  const spaces = [
    {
      name: "Green Energy Space",
      initials: "GE",
      href: "/space/green-energy",
    },
    {
      name: "Community Garden",
      initials: "CG",
      href: "/space/community-garden",
    },
    {
      name: "Digital Transformation",
      initials: "DT",
      href: "/space/digital-trans",
    },
  ];

  const virtualContributors = [
    { name: "Softmann", initials: "SM" },
    { name: "The Collaboration Methodologist", initials: "CM" },
  ];

  return (
    <aside
      className={cn(
        "bg-sidebar flex flex-col h-screen sticky top-0 transition-[width] duration-300 ease-in-out z-30 group/sidebar",
        isCollapsed ? "w-[80px]" : "w-64",
        className
      )}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Logo area with integrated collapse toggle */}
      <div className="h-16 relative flex items-center border-b border-sidebar-border/50 bg-sidebar shrink-0 px-4">
        {/* Full logo — visible when expanded */}
        <div
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out overflow-hidden",
            isCollapsed
              ? "opacity-0 w-0 pointer-events-none"
              : "opacity-100 w-auto delay-100"
          )}
        >
          <Link to="/" className="block">
            <div className="w-[180px] h-[24px] ml-2">
              <AlkemioLogo />
            </div>
          </Link>
        </div>

        {/* Symbol — visible when collapsed */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            isCollapsed
              ? "opacity-100 scale-100 delay-100"
              : "opacity-0 scale-95 pointer-events-none"
          )}
        >
          <Link to="/" className="block">
            <div className="w-[28px] h-[28px]">
              <AlkemioSymbolSquare />
            </div>
          </Link>
        </div>

        {/* Collapse/expand toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "shrink-0 flex items-center justify-center w-7 h-7 rounded-md transition-colors text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
            isCollapsed && "absolute right-1/2 translate-x-1/2 bottom-1"
          )}
          type="button"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <ChevronsLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto overflow-x-hidden">
        {/* Nav items */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href && location.pathname === item.href;
            const commonClasses = cn(
              "flex items-center rounded-md transition-colors h-10 w-full",
              isCollapsed ? "justify-center px-0" : "justify-between px-3",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            );

            const content = (
              <>
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span
                    className={cn(
                      "whitespace-nowrap transition-all duration-300",
                      isCollapsed
                        ? "w-0 opacity-0 overflow-hidden hidden"
                        : "w-auto opacity-100 block"
                    )}
                    style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" as any }}
                  >
                    {item.label}
                  </span>
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    className="rounded-full"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "1px 6px",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={commonClasses}
                  title={isCollapsed ? item.label : undefined}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={commonClasses}
                title={isCollapsed ? item.label : undefined}
                type="button"
              >
                {content}
              </button>
            );
          })}
        </div>

        {/* MY SPACES */}
        <div>
          {!isCollapsed && (
            <div
              className="uppercase tracking-wider px-3 mb-3 whitespace-nowrap overflow-hidden transition-opacity duration-300"
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--sidebar-foreground)",
                opacity: 0.5,
              }}
            >
              {t("nav.mySpaces")}
            </div>
          )}
          {isCollapsed && (
            <div className="w-full h-px bg-sidebar-border/50 my-3 transition-opacity duration-300" />
          )}
          <div className="space-y-1">
            {spaces.map((space) => (
              <Link
                key={space.href}
                to={space.href}
                className={cn(
                  "flex items-center gap-3 rounded-md transition-colors h-10",
                  isCollapsed ? "justify-center px-0" : "px-3"
                )}
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "color-mix(in srgb, var(--sidebar-foreground) 70%, transparent)",
                }}
                title={isCollapsed ? space.name : undefined}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "color-mix(in srgb, var(--primary) 10%, transparent)",
                    color: "var(--primary)",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  {space.initials}
                </div>
                <span
                  className={cn(
                    "truncate transition-all duration-300",
                    isCollapsed
                      ? "w-0 opacity-0 overflow-hidden hidden"
                      : "w-auto opacity-100 block"
                  )}
                >
                  {space.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* VIRTUAL CONTRIBUTORS */}
        <div>
          {!isCollapsed && (
            <div
              className="uppercase tracking-wider px-3 mb-3 whitespace-nowrap overflow-hidden transition-opacity duration-300"
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--sidebar-foreground)",
                opacity: 0.5,
              }}
            >
              Virtual Contributors
            </div>
          )}
          {isCollapsed && (
            <div className="w-full h-px bg-sidebar-border/50 my-3 transition-opacity duration-300" />
          )}
          <div className="space-y-1">
            {virtualContributors.map((vc) => (
              <button
                key={vc.name}
                className={cn(
                  "flex items-center gap-3 rounded-md transition-colors h-10 w-full",
                  isCollapsed ? "justify-center px-0" : "px-3"
                )}
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "color-mix(in srgb, var(--sidebar-foreground) 70%, transparent)",
                }}
                title={isCollapsed ? vc.name : undefined}
              >
                <Avatar className="w-6 h-6 shrink-0">
                  <AvatarFallback
                    className="text-[9px] font-bold"
                    style={{
                      background:
                        "color-mix(in srgb, var(--chart-2) 15%, transparent)",
                      color: "var(--chart-2)",
                    }}
                  >
                    <Bot className="w-3.5 h-3.5" />
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "truncate transition-all duration-300",
                    isCollapsed
                      ? "w-0 opacity-0 overflow-hidden hidden"
                      : "w-auto opacity-100 block"
                  )}
                >
                  {vc.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity View toggle */}
      <div
        className={cn(
          "transition-all duration-300 p-4"
        )}
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "justify-center" : "justify-between px-2"
          )}
        >
          {!isCollapsed ? (
            <>
              <div
                className="flex items-center gap-2 whitespace-nowrap overflow-hidden"
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)" as any,
                  color: "color-mix(in srgb, var(--sidebar-foreground) 80%, transparent)",
                }}
              >
                <Eye className="w-4 h-4" />
                <span>{t("nav.activityView")}</span>
              </div>
              <Switch id="activity-view" />
            </>
          ) : (
            <Eye
              className="w-4 h-4"
              style={{
                color: "color-mix(in srgb, var(--sidebar-foreground) 70%, transparent)",
              }}
            />
          )}
        </div>
      </div>

      <InvitationsDialog
        open={showInvitations}
        onOpenChange={setShowInvitations}
      />
      <CreateSpaceDialog
        open={showCreateSpace}
        onOpenChange={setShowCreateSpace}
      />
    </aside>
  );
}
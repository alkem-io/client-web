import { useState } from "react";
import {
  Rocket,
  Mail,
  Lightbulb,
  Bot,
  LayoutTemplate,
  Tag,
  Eye,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Switch } from "@/app/components/ui/switch";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { InvitationsDialog } from "@/app/components/dialogs/InvitationsDialog";
import { CreateSpaceDialog } from "@/app/components/dialogs/CreateSpaceDialog";
import { useLanguage } from "@/app/contexts/LanguageContext";

export function DashboardSidebar() {
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
    { name: "Green Energy Space", initials: "GE", href: "/space/green-energy" },
    { name: "Community Garden", initials: "CG", href: "/space/community-garden" },
    { name: "Digital Transformation", initials: "DT", href: "/space/digital-trans" },
  ];

  const virtualContributors = [
    { name: "Softmann", initials: "SM" },
    { name: "The Collaboration Methodologist", initials: "CM" },
  ];

  return (
    <nav className="sticky top-20 space-y-6">
      {/* Nav items */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = item.href && location.pathname === item.href;
          const commonClasses = cn(
            "flex items-center justify-between rounded-md transition-colors h-9 w-full px-2 text-sm",
            isActive
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          );

          const content = (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-px">
                  {item.badge}
                </span>
              )}
            </>
          );

          if (item.href) {
            return (
              <Link key={item.label} to={item.href} className={commonClasses}>
                {content}
              </Link>
            );
          }

          return (
            <button key={item.label} onClick={item.onClick} className={commonClasses} type="button">
              {content}
            </button>
          );
        })}
      </div>

      {/* My Spaces */}
      <div>
        <div className="uppercase tracking-wider px-2 mb-2 text-[11px] font-semibold text-muted-foreground/50">
          {t("nav.mySpaces")}
        </div>
        <div className="space-y-1">
          {spaces.map((space) => (
            <Link
              key={space.href}
              to={space.href}
              className="flex items-center gap-2.5 rounded-md transition-colors h-9 px-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            >
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-primary/10 text-primary text-[10px] font-bold">
                {space.initials}
              </div>
              <span className="truncate">{space.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Virtual Contributors */}
      <div>
        <div className="uppercase tracking-wider px-2 mb-2 text-[11px] font-semibold text-muted-foreground/50">
          Virtual Contributors
        </div>
        <div className="space-y-1">
          {virtualContributors.map((vc) => (
            <button
              key={vc.name}
              className="flex items-center gap-2.5 rounded-md transition-colors h-9 px-2 w-full text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              type="button"
            >
              <Avatar className="w-6 h-6 shrink-0">
                <AvatarFallback className="text-[9px] font-bold bg-chart-2/15 text-chart-2">
                  <Bot className="w-3.5 h-3.5" />
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{vc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity View toggle */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>{t("nav.activityView")}</span>
          </div>
          <Switch id="activity-view" />
        </div>
      </div>

      <InvitationsDialog open={showInvitations} onOpenChange={setShowInvitations} />
      <CreateSpaceDialog open={showCreateSpace} onOpenChange={setShowCreateSpace} />
    </nav>
  );
}

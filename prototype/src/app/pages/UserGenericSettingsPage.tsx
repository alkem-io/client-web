import { useParams, Link, useLocation } from "react-router";
import { User, Layout, CreditCard, Users, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserGenericSettingsPage({ title = "Settings" }: { title?: string }) {
  const { userSlug } = useParams<{ userSlug: string }>();
  const slug = userSlug || "user";
  const location = useLocation();

  const tabs = [
    { label: "MY PROFILE", href: `/user/${slug}/settings/profile`, icon: User },
    { label: "ACCOUNT", href: `/user/${slug}/settings/account`, icon: Layout },
    { label: "MEMBERSHIP", href: `/user/${slug}/settings/membership`, icon: CreditCard },
    { label: "ORGANIZATIONS", href: `/user/${slug}/settings/organizations`, icon: Users },
    { label: "NOTIFICATIONS", href: `/user/${slug}/settings/notifications`, icon: Bell },
    { label: "SETTINGS", href: `/user/${slug}/settings/general`, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Sticky Header / Navigation Area */}
      <div className="sticky top-16 z-20 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 md:px-8 pt-8 pb-0">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your personal profile and account preferences.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isActive = location.pathname.includes(tab.href);
              return (
                <Link
                  key={tab.label}
                  to={tab.href}
                  className={cn(
                    "flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-xl bg-muted/5">
            <h2 className="text-2xl font-semibold mb-2">{title}</h2>
            <p className="text-muted-foreground">This section is currently under development.</p>
        </div>
      </div>
    </div>
  );
}

import { 
  Info, Layout, Users, Layers, FileText, HardDrive, Settings, User, 
  ChevronDown, ChevronRight, LogOut, ArrowLeft 
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";

interface NavItem {
  label: string;
  icon: React.ElementType;
  id: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "SPACE IDENTITY",
    items: [
      { label: "About", icon: Info, id: "about" },
      { label: "Layout", icon: Layout, id: "layout" },
    ]
  },
  {
    title: "MEMBER MANAGEMENT",
    items: [
      { label: "Community", icon: Users, id: "community" },
      { label: "Subspaces", icon: Layers, id: "subspaces" },
    ]
  },
  {
    title: "CONTENT & RESOURCES",
    items: [
      { label: "Templates", icon: FileText, id: "templates" },
      { label: "Storage", icon: HardDrive, id: "storage" },
    ]
  },
  {
    title: "ADVANCED",
    items: [
      { label: "Settings", icon: Settings, id: "settings" },
      { label: "Account", icon: User, id: "account" },
    ]
  }
];

export function SpaceSettingsSidebar({ className }: { className?: string }) {
  const { spaceSlug, tab } = useParams<{ spaceSlug: string; tab: string }>();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupTitle: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  return (
    <aside className={cn("w-64 bg-muted/30 border-r border-border h-full flex flex-col shrink-0", className)}>
      <div className="p-4 border-b border-border bg-background">
        <Link 
          to={`/space/${spaceSlug}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Space
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            IH
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Green Energy Space</h2>
            <p className="text-xs text-muted-foreground">Space Settings</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <button
              onClick={() => toggleGroup(group.title)}
              className="flex items-center w-full text-xs font-semibold text-muted-foreground mb-2 px-2 hover:text-foreground transition-colors"
            >
              {collapsedGroups[group.title] ? (
                <ChevronRight className="w-3 h-3 mr-1" />
              ) : (
                <ChevronDown className="w-3 h-3 mr-1" />
              )}
              {group.title}
            </button>
            
            {!collapsedGroups[group.title] && (
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = tab === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={`/space/${spaceSlug}/settings/${item.id}`}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                        isActive 
                          ? "bg-primary/10 text-primary border-l-2 border-primary" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>


    </aside>
  );
}

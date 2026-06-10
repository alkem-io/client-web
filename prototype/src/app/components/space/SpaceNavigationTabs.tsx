import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface SpaceNavigationTabsProps {
  spaceSlug: string;
  actionButton?: React.ReactNode;
  onActiveTabChange?: (description: string) => void;
}

export const SPACE_TABS = [
  { 
    label: "Home", 
    href: "/home",
    description: "Activity and updates from members of this space."
  },
  { 
    label: "Community", 
    href: "/community",
    description: "Members and contributors in this space."
  },
  { 
    label: "Subspaces", 
    href: "/subspaces",
    description: "Focused collaboration areas within this space."
  },
  { 
    label: "Knowledge Base", 
    href: "/knowledge-base",
    description: "Curated resources, documents, and knowledge."
  },
];

export function SpaceNavigationTabs({ spaceSlug, actionButton, onActiveTabChange }: SpaceNavigationTabsProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs = SPACE_TABS.map(tab => ({
    ...tab,
    href: `/space/${spaceSlug}${tab.href === "/home" ? "" : tab.href}`
  }));

  const isActive = (href: string) => {
    if (href.endsWith(`/${spaceSlug}`)) {
      return currentPath === href;
    }
    return currentPath.startsWith(href);
  };

  useEffect(() => {
    if (scrollRef.current) {
      const activeTab = scrollRef.current.querySelector(
        '[data-active="true"]'
      );
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
    // Notify parent of active tab description
    const activeTabData = tabs.find(tab => isActive(tab.href));
    if (activeTabData && onActiveTabChange) {
      onActiveTabChange(activeTabData.description);
    }
  }, [currentPath]);

  return (
    <nav className="w-full">
      <div className="flex items-end justify-between gap-4 relative">
        {/* Bottom border line that runs the full width */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />

        <div
          ref={scrollRef}
          className="flex items-end gap-0 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] overscroll-x-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              to={tab.href}
              data-active={active}
              className={cn(
                "relative px-5 py-3 transition-all duration-200 whitespace-nowrap select-none rounded-t-lg",
                active
                  ? "bg-background text-foreground font-semibold border border-border border-b-0 z-10 -mb-px"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
              )}
              style={{
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
                lineHeight: "20px",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
        </div>
        {actionButton && (
          <div className="shrink-0 pb-3 relative z-10">
            {actionButton}
          </div>
        )}
      </div>
    </nav>
  );
}

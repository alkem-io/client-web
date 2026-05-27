import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { ReadMoreText } from "@/app/components/ui/ReadMoreText";

interface SpaceNavigationTabsProps {
  spaceSlug: string;
  /** Optional action button rendered inline with tabs */
  actionButton?: React.ReactNode;
}

export function SpaceNavigationTabs({ spaceSlug, actionButton }: SpaceNavigationTabsProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { label: "Home", href: `/space/${spaceSlug}`, description: "This Space is about building Alkemio, together. We invite everyone in our ecosystem to join the conversations, share ideas, and contribute to the development of the platform. Alkemio has always been a collaborative effort, and this Space is where we can discuss and shape its future." },
    { label: "Community", href: `/space/${spaceSlug}/community`, description: "Connect with fellow members, see who's contributing, and discover the people and organizations driving this Space forward. Find collaborators, follow interesting contributors, and grow your network." },
    { label: "Subspaces", href: `/space/${spaceSlug}/subspaces`, description: "Explore focused collaboration areas within this Space. Each Subspace tackles a specific challenge or topic, with its own community, knowledge base, and innovation flow." },
    { label: "Knowledge Base", href: `/space/${spaceSlug}/knowledge-base`, description: "A curated library of documents, research, templates, and reference materials shared by the community. Browse, search, and contribute resources to build our collective knowledge." },
  ];

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
  }, [currentPath]);

  const activeTab = tabs.find((tab) => isActive(tab.href));

  return (
    <nav className="w-full">
      <div className="flex items-center justify-between gap-4">
        <div
          ref={scrollRef}
          className="flex items-center gap-6 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] overscroll-x-contain"
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
                "pb-2 transition-all duration-200 whitespace-nowrap border-b-2 select-none",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              )}
              style={{
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                fontFamily: "'Inter', sans-serif",
                lineHeight: "20px",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
        </div>
        <div className="shrink-0 pb-2">
          {actionButton}
        </div>
      </div>
      {/* Active tab description */}
      {activeTab?.description && (
        <div className="mt-3">
          <ReadMoreText
            maxLines={2}
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--muted-foreground)",
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1.6,
            }}
            toggleColor="var(--muted-foreground)"
          >
            {activeTab.description}
          </ReadMoreText>
        </div>
      )}
    </nav>
  );
}

import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface SpaceNavigationTabsProps {
  spaceSlug: string;
}

export function SpaceNavigationTabs({ spaceSlug }: SpaceNavigationTabsProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { label: "Home", href: `/space/${spaceSlug}` },
    { label: "Community", href: `/space/${spaceSlug}/community` },
    { label: "Subspaces", href: `/space/${spaceSlug}/subspaces` },
    { label: "Knowledge Base", href: `/space/${spaceSlug}/knowledge-base` },
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

  return (
    <nav className="w-full">
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
    </nav>
  );
}

import { cn } from "@/lib/utils";
import { Hash } from "lucide-react";

export interface CalloutTab {
  id: string;
  label: string;
  count?: number;
  pinned?: boolean;
}

interface CalloutTabsProps {
  tabs: CalloutTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function CalloutTabs({
  tabs,
  activeTab,
  onTabChange,
}: CalloutTabsProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      style={{ fontFamily: "var(--font-family, 'Inter', sans-serif)" }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-all duration-200 select-none",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: isActive ? 600 : 500,
              letterSpacing: "0.02em",
              background: isActive
                ? "var(--primary)"
                : "var(--muted)",
              border: `1px solid ${isActive ? "var(--primary)" : "var(--border)"}`,
            }}
          >
            {tab.id !== "all" && (
              <Hash
                className="w-3 h-3"
                style={{ opacity: isActive ? 1 : 0.6 }}
              />
            )}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className="rounded-full px-1.5 py-0.5"
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  lineHeight: 1,
                  background: isActive
                    ? "color-mix(in srgb, var(--primary-foreground) 20%, transparent)"
                    : "color-mix(in srgb, var(--muted-foreground) 12%, transparent)",
                  color: isActive
                    ? "var(--primary-foreground)"
                    : "var(--muted-foreground)",
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

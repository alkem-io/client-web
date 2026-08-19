import type { ComponentType, SVGProps } from 'react';
import { cn } from '@/crd/lib/utils';

export type SpaceSettingsTabDescriptor<TTabId extends string> = {
  id: TTabId;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type SpaceSettingsTabStripProps<TTabId extends string> = {
  activeTab: TTabId;
  onTabChange: (next: TTabId) => void;
  tabs: ReadonlyArray<SpaceSettingsTabDescriptor<TTabId>>;
  className?: string;
};

/**
 * Horizontal folder-style tab strip for the Settings header.
 *
 * Each tab renders as a button with icon + label. The active tab is a raised
 * card (background fill, border on three sides, rounded top corners) that
 * overlaps the header's bottom hairline via -mb-px. Scrolls horizontally
 * on narrow viewports. Accessibility: `role="tablist"` + `role="tab"` with
 * `aria-selected` — arrow key navigation is NOT implemented here (Radix Tabs
 * has it, but we use a custom strip because the Radix default pill style
 * doesn't match the prototype's folder-tab aesthetic).
 */
export function SpaceSettingsTabStrip<TTabId extends string>({
  activeTab,
  onTabChange,
  tabs,
  className,
}: SpaceSettingsTabStripProps<TTabId>) {
  return (
    <div className={cn('relative', className)}>
      {/* Bottom border line that runs the full width — the active tab covers it with -mb-px */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" aria-hidden="true" />
      <div
        role="tablist"
        className="flex items-end overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = id === activeTab;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(id)}
              className={cn(
                'relative inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-control transition-colors shrink-0',
                'rounded-t-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset',
                isActive
                  ? 'bg-background text-foreground font-semibold border border-border border-b-0 z-10 -mb-px'
                  : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

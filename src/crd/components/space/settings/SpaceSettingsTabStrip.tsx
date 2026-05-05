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
 * Horizontal underlined tab strip matching the prototype's Settings header.
 *
 * Each tab renders as a button with icon + label. The active tab has a bold
 * label and a 2px bottom border in the primary color. Scrolls horizontally
 * on narrow viewports. Accessibility: `role="tablist"` + `role="tab"` with
 * `aria-selected` — arrow key navigation is NOT implemented here (Radix Tabs
 * has it, but we use a custom strip because the Radix default pill style
 * doesn't match the prototype's underlined aesthetic).
 */
export function SpaceSettingsTabStrip<TTabId extends string>({
  activeTab,
  onTabChange,
  tabs,
  className,
}: SpaceSettingsTabStripProps<TTabId>) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-x-1 overflow-x-auto overflow-y-hidden',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className
      )}
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
              'inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm transition-colors shrink-0',
              'border-b-2 -mb-px outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 rounded-t-sm',
              isActive
                ? 'border-primary text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

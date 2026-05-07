import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/crd/lib/utils';

export type SettingsTabDescriptor<TTabId extends string> = {
  id: TTabId;
  label: string;
  icon: LucideIcon;
  /** When true, the tab is omitted from the strip entirely. */
  hidden?: boolean;
};

type SettingsTabStripProps<TTabId extends string> = {
  activeTab: TTabId;
  onTabChange: (next: TTabId) => void;
  tabs: ReadonlyArray<SettingsTabDescriptor<TTabId>>;
  className?: string;
};

/**
 * Actor-agnostic horizontal underlined tab strip for contributor settings
 * shells (User: 7 tabs; Org: 5 tabs). Mirrors the 045 SpaceSettingsTabStrip
 * aesthetic but accepts the generic `SettingsTabDescriptor` shape.
 *
 * On viewports below `md` the strip is horizontally scrollable; the active
 * tab is auto-scrolled into view on mount and on every tab change (FR-014).
 * Keyboard navigation is handled by the browser's default tab-order through
 * the buttons; arrow-key activation can be added later if needed.
 */
export function SettingsTabStrip<TTabId extends string>({
  activeTab,
  onTabChange,
  tabs,
  className,
}: SettingsTabStripProps<TTabId>) {
  const visibleTabs = tabs.filter(tab => !tab.hidden);

  const stripRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = activeTabRef.current;
    const strip = stripRef.current;
    if (!button || !strip) return;
    button.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div
      ref={stripRef}
      role="tablist"
      className={cn(
        'flex items-center gap-x-1 overflow-x-auto overflow-y-hidden',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className
      )}
    >
      {visibleTabs.map(({ id, label, icon: Icon }) => {
        const isActive = id === activeTab;
        return (
          <button
            key={id}
            ref={isActive ? activeTabRef : undefined}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(id)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-control transition-colors shrink-0',
              'border-b-2 -mb-px outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 rounded-t-sm',
              isActive
                ? 'border-primary text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span className="uppercase tracking-wide">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

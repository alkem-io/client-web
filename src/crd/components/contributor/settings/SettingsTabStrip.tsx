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
 * shells (User: 7 tabs; Org: 5 tabs).
 *
 * Mirrors `client-web-prototype/src/app/pages/UserAccountPage.tsx` — tabs are bare
 * `<button>` elements with bottom-border underlines, `gap-6` apart, no
 * per-tab horizontal padding. Active state uses `border-primary text-primary`;
 * inactive uses muted text + transparent border with hover lifts.
 *
 * On viewports below `md` the strip is horizontally scrollable; the active
 * tab auto-scrolls into view on mount and on every tab change (FR-014).
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
        'flex items-center gap-6 overflow-x-auto overflow-y-hidden',
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
              'inline-flex shrink-0 items-center gap-2 whitespace-nowrap pb-4',
              'text-control border-b-2 -mb-px transition-colors',
              'outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 rounded-t-sm',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
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

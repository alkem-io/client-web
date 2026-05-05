import type { ComponentProps, ReactNode } from 'react';
import { SpaceHeader } from '@/crd/components/space/SpaceHeader';
import { cn } from '@/crd/lib/utils';
import { type SpaceSettingsTabDescriptor, SpaceSettingsTabStrip } from './SpaceSettingsTabStrip';

type SpaceHeaderProps = ComponentProps<typeof SpaceHeader>;

type SpaceSettingsShellProps<TTabId extends string> = {
  hero: SpaceHeaderProps;
  activeTab: TTabId;
  onTabChange: (next: TTabId) => void;
  tabs: ReadonlyArray<SpaceSettingsTabDescriptor<TTabId>>;
  children: ReactNode;
  className?: string;
};

/**
 * Page shell for CRD Space Settings. Reuses the CRD Space Page's SpaceHeader
 * verbatim, then renders the tab strip and the active tab's content.
 *
 * Presentational only — the page-level controller owns `activeTab`,
 * `onTabChange`, and the active tab panel content.
 */
export function SpaceSettingsShell<TTabId extends string>({
  hero,
  activeTab,
  onTabChange,
  tabs,
  children,
  className,
}: SpaceSettingsShellProps<TTabId>) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <SpaceHeader {...hero} />
      <SpaceSettingsTabStrip activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
      <div className="pb-24">{children}</div>
    </div>
  );
}

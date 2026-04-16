import type { ComponentType, SVGProps } from 'react';
import { cn } from '@/crd/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/crd/primitives/tabs';

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
 * Horizontal tab strip built on Radix Tabs. Scrolls horizontally on narrow
 * viewports. Accessibility (role=tablist, arrow-key navigation) is provided
 * by the Radix primitive — do not reimplement.
 *
 * Generic over `TTabId` so each tab group (Space Settings, future CRD pages)
 * can use its own string-literal union of tab ids.
 */
export function SpaceSettingsTabStrip<TTabId extends string>({
  activeTab,
  onTabChange,
  tabs,
  className,
}: SpaceSettingsTabStripProps<TTabId>) {
  return (
    <Tabs value={activeTab} onValueChange={value => onTabChange(value as TTabId)} className={cn('w-full', className)}>
      <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b bg-transparent p-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <TabsTrigger
            key={id}
            value={id}
            className={cn(
              'flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3',
              'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold'
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
            <span>{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

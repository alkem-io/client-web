import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { type SettingsTabDescriptor, SettingsTabStrip } from './SettingsTabStrip';

export type SettingsShellHeader = {
  avatarUrl?: string;
  /** Two-letter fallback when the avatar URL is missing. */
  avatarFallback?: string;
  displayName: string;
  /** Optional secondary line under the display name. */
  subtitle?: string;
  /** Deterministic tile colour (from `pickColorFromId`) for the avatar fallback. */
  avatarColor?: string;
};

type SettingsShellProps<TTabId extends string> = {
  header: SettingsShellHeader;
  activeTab: TTabId;
  onTabChange: (next: TTabId) => void;
  tabs: ReadonlyArray<SettingsTabDescriptor<TTabId>>;
  /** The active tab body. */
  children: ReactNode;
  className?: string;
};

/**
 * Actor-agnostic settings shell — sticky header (avatar + display name) +
 * horizontal tab strip + body slot. Both User (7 tabs) and Organization (5
 * tabs) consume this primitive (research §9 / FR-013).
 *
 * Pure presentational — receives `tabs`, `activeTab`, `onTabChange`, and
 * `header` as props. Behavior (URL navigation, data fetching, predicates)
 * lives in the integration layer per `src/crd/CLAUDE.md`.
 */
export function SettingsShell<TTabId extends string>({
  header,
  activeTab,
  onTabChange,
  tabs,
  children,
  className,
}: SettingsShellProps<TTabId>) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 pt-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-6 md:px-6">
        <div className="flex items-center gap-3 pb-3">
          <Avatar className="size-12">
            {header.avatarUrl ? <AvatarImage src={header.avatarUrl} alt="" /> : null}
            <AvatarFallback
              className="text-white"
              style={header.avatarColor ? { backgroundColor: header.avatarColor } : undefined}
            >
              {header.avatarFallback ?? '??'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-section-title truncate">{header.displayName}</h1>
            {header.subtitle ? <p className="text-caption text-muted-foreground truncate">{header.subtitle}</p> : null}
          </div>
        </div>
        <SettingsTabStrip activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
      </div>
      <div className="pb-24">{children}</div>
    </div>
  );
}

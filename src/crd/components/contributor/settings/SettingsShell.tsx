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
 * Visual structure mirrors `client-web-prototype/src/app/pages/UserAccountPage.tsx`:
 * - Sticky header band (`sticky top-16 z-20`) sits below the CRD app header
 *   (which is `h-16 z-50`); solid `bg-card` with bottom border.
 * - Body and header content centered via 12-col grid (`col-start-2
 *   col-span-10` on `lg+`).
 *
 * Pure presentational — receives `tabs`, `activeTab`, `onTabChange`, and
 * `header` as props. Behaviour (URL navigation, data fetching, predicates)
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
    <div className={cn('min-h-screen bg-background pb-12', className)}>
      <div className="sticky top-16 z-20 border-b border-border bg-card">
        <div className="px-6 pt-8 pb-0 md:px-8">
          <CenteredColumn>
            <div className="mb-8 flex items-center gap-4">
              <Avatar className="size-12 shrink-0">
                {header.avatarUrl ? <AvatarImage src={header.avatarUrl} alt="" /> : null}
                <AvatarFallback
                  className="text-white"
                  style={header.avatarColor ? { backgroundColor: header.avatarColor } : undefined}
                >
                  {header.avatarFallback ?? '??'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="text-page-title truncate tracking-tight">{header.displayName}</h1>
                {header.subtitle ? (
                  <p className="text-caption text-muted-foreground truncate">{header.subtitle}</p>
                ) : null}
              </div>
            </div>
            <SettingsTabStrip activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
          </CenteredColumn>
        </div>
      </div>
      <div className="px-6 py-8 md:px-8">
        <CenteredColumn>{children}</CenteredColumn>
      </div>
    </div>
  );
}

/**
 * Two-deep grid used by both the header and body to mirror the prototype's
 * `col-span-12 lg:col-start-2 lg:col-span-10` layout. Centralized so the
 * header avatar / tab strip and body content always line up vertically.
 */
function CenteredColumn({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-10 lg:col-start-2">{children}</div>
    </div>
  );
}

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { formatRelativeFromNowStrict } from '@/crd/lib/dateTimeFormat';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';
import { glyphForSlug } from './reactionEmoji';

export type WhoReactedRow = {
  id: string;
  emoji: string;
  /** ISO 8601 date-time string of when the reaction was last changed */
  updatedDate: string;
  user?: {
    displayName: string;
    avatarUrl?: string;
  } | null;
};

export type WhoReactedPopoverProps = {
  rows: WhoReactedRow[];
  /** Whether the popover is open */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Trigger element — typically the ReactionTotalPill */
  trigger: ReactNode;
};

/**
 * Popover showing who reacted and when, ordered most-recent-first (server-sorted).
 * Rows with unknown slugs are silently skipped. Lazy — the consumer should mount
 * this only after the user clicks to expand (tier-2 on-demand, FR-007).
 *
 * Deliberately shows no per-emoji counts or leaderboard-style grouping.
 */
export function WhoReactedPopover({ rows, open, onOpenChange, trigger }: WhoReactedPopoverProps) {
  const { t, i18n } = useTranslation('crd-reactions');
  const locale = resolveDateFnsLocale(i18n.language);

  const renderableRows = rows.filter(row => glyphForSlug(row.emoji) !== undefined);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild={true}>{trigger}</PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-64 p-2" onOpenAutoFocus={event => event.preventDefault()}>
        <p className="mb-1.5 px-1 text-caption font-semibold text-foreground">{t('whoReactedTitle')}</p>
        {renderableRows.length === 0 ? (
          <p className="px-1 text-caption text-muted-foreground">{t('whoReactedEmpty')}</p>
        ) : (
          <ul className="max-h-56 space-y-0.5 overflow-y-auto">
            {renderableRows.map(row => {
              const glyph = glyphForSlug(row.emoji);
              const relativeTime = formatRelativeFromNowStrict(row.updatedDate, locale);

              return (
                <li key={row.id} className="flex items-center gap-2 rounded-md px-1 py-1">
                  <Avatar className="size-6 shrink-0">
                    {row.user?.avatarUrl && <AvatarImage src={row.user.avatarUrl} alt={row.user.displayName} />}
                    <AvatarFallback className="text-[10px]">{row.user?.displayName.charAt(0) ?? '?'}</AvatarFallback>
                  </Avatar>
                  {/* Name on its own line with the "when" as subtext beneath it — the
                      display name gets the full row width instead of competing with the time. */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-caption text-foreground">{row.user?.displayName ?? ''}</p>
                    {relativeTime && <p className="truncate text-caption text-muted-foreground">{relativeTime}</p>}
                  </div>
                  {/* Emoji glyph — no count, just the reaction identity */}
                  <span className="shrink-0 text-body" aria-hidden="true">
                    {glyph}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

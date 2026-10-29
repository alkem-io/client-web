import { Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { VC_PAUSED_LEARN_MORE_URL } from '@/crd/components/virtualContributor/VcPausedNotice';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import type { CrdMentionSuggestion } from './types';

type MentionSuggestionItemProps = {
  suggestion: CrdMentionSuggestion;
  focused: boolean;
};

export function MentionSuggestionItem({ suggestion, focused }: MentionSuggestionItemProps) {
  const { t } = useTranslation('crd-space');
  const { t: tCommon } = useTranslation('crd-common');
  const locationParts = [suggestion.city, suggestion.country].filter(Boolean);

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 text-body transition-colors',
        focused ? 'bg-accent text-accent-foreground' : 'text-foreground',
        // TEMP: VCs disabled (#10398)
        suggestion.unavailable && 'cursor-not-allowed'
      )}
      aria-disabled={suggestion.unavailable || undefined}
    >
      <Avatar className={cn('h-7 w-7 shrink-0', suggestion.unavailable && 'opacity-50')}>
        {suggestion.avatarUrl && <AvatarImage src={suggestion.avatarUrl} alt={suggestion.displayName} />}
        <AvatarFallback className="text-caption">{suggestion.displayName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 truncate">
          <span className={cn('truncate text-body-emphasis', suggestion.unavailable && 'text-muted-foreground')}>
            {suggestion.displayName}
          </span>
          {suggestion.virtualContributor && !suggestion.unavailable && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-badge text-primary"
              title={t('comments.mentionVirtualContributor')}
            >
              <Bot className="h-3 w-3" aria-hidden="true" />
              {t('comments.mentionVirtualContributor')}
            </span>
          )}
        </div>
        {/* TEMP: VCs disabled (#10398) */}
        {suggestion.unavailable && (
          <div className="truncate text-caption text-muted-foreground">
            {tCommon('vcPaused.mentionUnavailable')}
            <span aria-hidden="true" className="mx-1">
              ·
            </span>
            <a
              href={VC_PAUSED_LEARN_MORE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
              // Keep the click from reaching react-mentions, which would try to pick the suggestion.
              onClick={event => event.stopPropagation()}
            >
              {tCommon('vcPaused.learnMore')}
            </a>
          </div>
        )}
        {locationParts.length > 0 && (
          <div className="truncate text-caption text-muted-foreground">{locationParts.join(', ')}</div>
        )}
      </div>
    </div>
  );
}

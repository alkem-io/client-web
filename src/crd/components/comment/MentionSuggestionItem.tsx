import { Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import type { CrdMentionSuggestion } from './types';

type MentionSuggestionItemProps = {
  suggestion: CrdMentionSuggestion;
  focused: boolean;
};

export function MentionSuggestionItem({ suggestion, focused }: MentionSuggestionItemProps) {
  const { t } = useTranslation('crd-space');
  const locationParts = [suggestion.city, suggestion.country].filter(Boolean);

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 text-body transition-colors',
        focused ? 'bg-accent text-accent-foreground' : 'text-foreground'
      )}
    >
      <Avatar className="h-7 w-7 shrink-0">
        {suggestion.avatarUrl && <AvatarImage src={suggestion.avatarUrl} alt={suggestion.displayName} />}
        <AvatarFallback className="text-caption">{suggestion.displayName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 truncate">
          <span className="truncate text-body-emphasis">{suggestion.displayName}</span>
          {suggestion.virtualContributor && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-badge text-primary"
              title={t('comments.mentionVirtualContributor')}
            >
              <Bot className="h-3 w-3" aria-hidden="true" />
              {t('comments.mentionVirtualContributor')}
            </span>
          )}
        </div>
        {locationParts.length > 0 && (
          <div className="truncate text-caption text-muted-foreground">{locationParts.join(', ')}</div>
        )}
      </div>
    </div>
  );
}

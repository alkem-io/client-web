import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { EventCardHeader } from './EventCardHeader';

type EventCardEvent = {
  id: string;
  title: string;
  description?: string;
  startDate: Date | undefined;
  durationMinutes: number;
  durationDays?: number;
  wholeDay: boolean;
  type?: string;
  subspaceName?: string;
};

type EventCardProps = {
  event: EventCardEvent;
  highlighted?: boolean;
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
};

/**
 * Clickable card wrapper around EventCardHeader + description preview + read-more link.
 * Highlighted state is driven by the consumer (list view's highlighted-day logic).
 */
export function EventCard({ event, highlighted, onClick, ref }: EventCardProps) {
  const { t } = useTranslation('crd-space');

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full flex-col gap-3 rounded-lg border bg-card p-4 text-left transition-colors',
        'hover:border-primary/40 hover:bg-accent/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer',
        highlighted ? 'border-primary ring-2 ring-primary' : 'border-border'
      )}
    >
      <EventCardHeader event={event} />
      {event.description && (
        <div className="pl-[3.75rem] text-xs text-muted-foreground line-clamp-2">
          <MarkdownContent content={event.description} />
        </div>
      )}
      <div className="pl-[3.75rem]">
        <span className="text-xs font-medium text-primary">{t('sidebar.readMore')} →</span>
      </div>
    </button>
  );
}

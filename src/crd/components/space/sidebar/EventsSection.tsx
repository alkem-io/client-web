import { ChevronDown, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';

type EventItem = {
  title: string;
  date: string;
};

type EventsSectionProps = {
  events: EventItem[];
  onShowCalendar?: () => void;
  onAddEvent?: () => void;
  className?: string;
};

export function EventsSection({ events, onShowCalendar, onAddEvent, className }: EventsSectionProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <h3 className="uppercase tracking-wider text-[11px] font-semibold text-muted-foreground">
            {t('sidebar.events')}
          </h3>
          <ChevronDown className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
        </div>
        {onAddEvent && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
              color: 'var(--primary)',
            }}
            onClick={onAddEvent}
            aria-label={t('sidebar.events')}
          >
            <Plus className="w-3 h-3" aria-hidden="true" />
          </Button>
        )}
      </div>
      {events.length === 0 ? (
        <p className="px-3 text-sm text-muted-foreground">{t('sidebar.noEvents')}</p>
      ) : (
        <div className="space-y-2 px-3">
          {events.map(event => (
            <div key={`${event.title}-${event.date}`} className="text-sm">
              <span className="text-foreground font-medium">{event.title}</span>
              <span className="text-muted-foreground ml-2">{event.date}</span>
            </div>
          ))}
        </div>
      )}
      {onShowCalendar && (
        <button
          type="button"
          className="px-3 mt-2 text-sm font-medium text-primary hover:underline cursor-pointer"
          onClick={onShowCalendar}
        >
          {t('sidebar.showCalendar')}
        </button>
      )}
    </div>
  );
}

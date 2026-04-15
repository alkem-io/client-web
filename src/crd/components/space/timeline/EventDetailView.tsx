import type { Locale } from 'date-fns';
import { format } from 'date-fns';
import { bg, de, enUS, es, fr, nl } from 'date-fns/locale';
import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { useMediaQuery } from '@/crd/hooks/useMediaQuery';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import { EventCardHeader } from './EventCardHeader';

type EventReference = {
  id: string;
  name: string;
  uri: string;
  description?: string;
};

type EventAuthor = {
  id: string;
  name: string;
  avatarUrl?: string;
  profileUrl?: string;
};

type EventDetailData = {
  id: string;
  title: string;
  description: string;
  bannerUrl?: string;
  tags: string[];
  references: EventReference[];
  startDate: Date | undefined;
  durationMinutes: number;
  durationDays?: number;
  wholeDay: boolean;
  type?: string;
  subspaceName?: string;
  author: EventAuthor;
  createdDate: Date | undefined;
  loading: boolean;
  notFound: boolean;
};

type EventDetailViewProps = {
  event: EventDetailData;
  showComments: boolean;
  commentCount?: number;
  commentsSlot?: ReactNode;
  commentInputSlot?: ReactNode;
  /** Required handler for the "not found" state's back button; also the same
   *  callback the parent wires to the dialog header's Back action. */
  onBack: () => void;
  /** Resolves an entity id to a deterministic colour. Invoked by the component
   *  lazily for fallback colours (banner when bannerUrl is undefined, author
   *  avatar when avatarUrl is undefined). The connector wires `pickColorFromId`
   *  to keep this component free of the business helper import. */
  resolveColor: (id: string) => string;
};

const DESKTOP_BREAKPOINT = '(min-width: 768px)';
const LOCALE_BY_LANG: Record<string, Locale> = { en: enUS, nl, es, bg, de, fr };

function resolveLocale(langCode: string | undefined): Locale {
  if (!langCode) return enUS;
  const base = langCode.split('-')[0];
  return LOCALE_BY_LANG[base] ?? enUS;
}

function authorInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function EventDetailView({
  event,
  showComments,
  commentCount,
  commentsSlot,
  commentInputSlot,
  onBack,
  resolveColor,
}: EventDetailViewProps) {
  const { t, i18n } = useTranslation('crd-space');
  const locale = resolveLocale(i18n.language);
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);

  if (event.notFound) {
    return (
      <div className="flex min-h-[16rem] flex-col items-center justify-center gap-3 p-8 text-center">
        <h2 className="text-lg font-semibold">{t('calendar.notFound.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('calendar.notFound.body')}</p>
        <Button variant="outline" onClick={onBack}>
          {t('calendar.notFound.backToList')}
        </Button>
      </div>
    );
  }

  const bannerBackground = event.bannerUrl
    ? `url("${event.bannerUrl}") center/cover`
    : `linear-gradient(135deg, ${resolveColor(event.id)}, color-mix(in srgb, ${resolveColor(event.id)} 70%, black))`;

  const avatarFallbackColor = event.author.id ? resolveColor(event.author.id) : undefined;

  const body = (
    <div className="flex flex-col gap-4">
      {event.bannerUrl ? (
        <div
          className="h-32 w-full rounded-md sm:h-40"
          style={{ background: bannerBackground }}
          role="img"
          aria-label={t('a11y.spaceBanner', { name: event.title })}
        />
      ) : (
        <div className="h-32 w-full rounded-md sm:h-40" style={{ background: bannerBackground }} aria-hidden={true} />
      )}
      {event.loading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      ) : (
        <>
          <EventCardHeader event={event} size="md" />
          {event.author.name && event.createdDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="h-5 w-5 shrink-0">
                {event.author.avatarUrl && <AvatarImage src={event.author.avatarUrl} alt={event.author.name} />}
                <AvatarFallback
                  className="text-[10px] text-white"
                  style={avatarFallbackColor ? { backgroundColor: avatarFallbackColor } : undefined}
                >
                  {authorInitial(event.author.name)}
                </AvatarFallback>
              </Avatar>
              <span>
                {t('calendar.details.createdBy', {
                  name: event.author.name,
                  date: format(event.createdDate, 'PPP', { locale }),
                })}
              </span>
            </div>
          )}
          {event.description && (
            <div className="text-sm">
              <MarkdownContent content={event.description} />
            </div>
          )}
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {event.references.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('calendar.details.references')}
              </h4>
              <ul className="space-y-1 text-sm">
                {event.references.map(ref => (
                  <li key={ref.id}>
                    <a
                      href={ref.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex items-center gap-1 text-primary hover:underline',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded'
                      )}
                    >
                      {ref.name}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                    {ref.description && <p className="text-xs text-muted-foreground">{ref.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );

  const commentsColumn = showComments ? (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t('calendar.details.comments')}
        {typeof commentCount === 'number' && <span className="ml-1 font-normal">({commentCount})</span>}
      </h4>
      <div className="min-h-0 flex-1 overflow-y-auto pr-2">{commentsSlot}</div>
      {commentInputSlot && <div className="border-t border-border pt-3">{commentInputSlot}</div>}
    </div>
  ) : null;

  if (!isDesktop) {
    return (
      <div className="flex flex-col gap-6">
        {body}
        {commentsColumn && <div className="border-t border-border pt-4">{commentsColumn}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-6">
      <div className="min-w-0 flex-1">{body}</div>
      {commentsColumn && (
        <div className="flex min-w-[20rem] max-w-[28rem] flex-1 flex-col border-l border-border pl-6">
          {commentsColumn}
        </div>
      )}
    </div>
  );
}

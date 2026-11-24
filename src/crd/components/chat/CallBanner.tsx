import { Phone, PhoneIncoming, PhoneOff, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

type CallMedia = 'video' | 'voice';

type CallBannerProps =
  | {
      variant: 'running';
      /** First names of the people in the call, in display order. */
      names: string[];
      /** When the call started (epoch ms). The elapsed time is left out when unknown. */
      startedAt?: number;
      /** Omitted when the user is already in the call on this device (another tab): the joined note shows instead. */
      onJoin?: (media: CallMedia) => void;
    }
  | {
      variant: 'ringing';
      callerName: string;
      onAnswer: () => void;
      onDecline: () => void;
    };

const stripClass =
  'flex shrink-0 items-center gap-2 border-b border-success/30 bg-success/10 px-3 py-2 text-caption text-foreground';
const filledButtonClass =
  'flex h-8 shrink-0 items-center gap-1.5 bg-success px-3 font-medium text-success-foreground hover:bg-success/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * A full-width strip under the chat header for the open conversation's call: either a running call
 * the user can join (who is in it, how long it has run) or an incoming 1:1 call to answer or decline.
 */
export function CallBanner(props: CallBannerProps) {
  const { t } = useTranslation('crd-chat');
  const startedAt = props.variant === 'running' ? props.startedAt : undefined;
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (startedAt === undefined) {
      return;
    }
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (props.variant === 'ringing') {
    return (
      <div role="alert" className={stripClass} data-testid="call-banner-ringing">
        <PhoneIncoming aria-hidden="true" className="size-4 shrink-0 text-success" />
        <span className="min-w-0 flex-1 truncate font-semibold">
          {t('call.banner.calling', { name: props.callerName })}
        </span>
        <button
          type="button"
          onClick={props.onDecline}
          aria-label={t('call.banner.decline')}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive text-white hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PhoneOff aria-hidden="true" className="size-4" />
        </button>
        <button type="button" onClick={props.onAnswer} className={`${filledButtonClass} rounded-md`}>
          <Phone aria-hidden="true" className="size-4" />
          {t('call.banner.answer')}
        </button>
      </div>
    );
  }

  const { names, onJoin } = props;
  const [first = '', second = ''] = names;
  let who = first;
  if (names.length === 2) {
    who = t('call.banner.participantsTwo', { first, second });
  } else if (names.length > 2) {
    who = t('call.banner.participantsMore', { first, second, count: names.length - 2 });
  }
  let elapsed = '';
  if (startedAt !== undefined) {
    const total = Math.max(0, Math.floor((now - startedAt) / 1000));
    const hours = Math.floor(total / 3600);
    const minutesAndSeconds = `${String(Math.floor((total % 3600) / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    elapsed = hours > 0 ? `${hours}:${minutesAndSeconds}` : minutesAndSeconds;
  }

  return (
    <output className={stripClass} data-testid="call-banner">
      <Phone aria-hidden="true" className="size-4 shrink-0 text-success" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold">{t('call.banner.inProgress')}</span>
        {(who || elapsed) && (
          <span className="truncate text-muted-foreground">
            {who}
            {/* Readable, but not announced: a status re-read every second would never stop announcing. */}
            {elapsed && <span aria-live="off">{who ? ` · ${elapsed}` : elapsed}</span>}
          </span>
        )}
      </span>
      {!onJoin && <span className="max-w-[50%] text-right text-muted-foreground">{t('call.joinedOnThisDevice')}</span>}
      {onJoin && (
        // biome-ignore lint/a11y/useSemanticElements: a group of two buttons, not a form fieldset
        <div role="group" aria-label={t('call.join')} className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => onJoin('video')}
            aria-label={t('call.joinVideo')}
            className={`${filledButtonClass} rounded-l-md`}
          >
            <Video aria-hidden="true" className="size-4" />
            {t('call.join')}
          </button>
          <Tooltip>
            <TooltipTrigger asChild={true}>
              <button
                type="button"
                onClick={() => onJoin('voice')}
                aria-label={t('call.joinAudio')}
                className={`${filledButtonClass} rounded-r-md border-l border-success-foreground/30 px-2`}
              >
                <Phone aria-hidden="true" className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{t('call.joinAudio')}</TooltipContent>
          </Tooltip>
        </div>
      )}
    </output>
  );
}

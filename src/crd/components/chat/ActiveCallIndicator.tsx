import { Phone, Video } from 'lucide-react';
import { chatHeaderIconButtonClass } from '@/crd/components/chat/CallControls';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

type JoinProps = {
  /** Names the pair of join buttons. */
  joinLabel: string;
  joinVideoLabel: string;
  joinAudioLabel: string;
  onJoinVideo: () => void;
  onJoinAudio: () => void;
};

type ActiveCallIndicatorProps = {
  activeLabel: string;
  /** Number of people in the call. */
  count: number;
  /** Omitted when there is nothing to join (the user is already in the call). */
  join?: JoinProps;
  /** Says why there is nothing to join, e.g. the call is joined from another tab. Shown on hover/focus of the pill. */
  joinedNote?: string;
};

/** "Call active · N" in a conversation header, with join buttons (video first, audio only) when joinable. */
export function ActiveCallIndicator({ activeLabel, count, join, joinedNote }: ActiveCallIndicatorProps) {
  const pill = (
    <span
      // Focusable only when it carries a note, so keyboard users can open the tooltip too.
      tabIndex={joinedNote ? 0 : undefined}
      className="flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary/10 px-2.5 text-caption font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
      <span>{activeLabel}</span>
      <span aria-hidden="true">·</span>
      <span data-testid="call-participant-count">{count}</span>
      {joinedNote && <span className="sr-only">{joinedNote}</span>}
    </span>
  );

  return (
    <div className="flex shrink-0 items-center gap-1" data-testid="call-active-indicator">
      {joinedNote ? (
        <Tooltip>
          <TooltipTrigger asChild={true}>{pill}</TooltipTrigger>
          <TooltipContent>{joinedNote}</TooltipContent>
        </Tooltip>
      ) : (
        pill
      )}
      {join && (
        // biome-ignore lint/a11y/useSemanticElements: a group of two buttons, not a form fieldset
        <div role="group" aria-label={join.joinLabel} className="flex items-center" data-testid="call-join">
          <Tooltip>
            <TooltipTrigger asChild={true}>
              <button
                type="button"
                aria-label={join.joinVideoLabel}
                onClick={join.onJoinVideo}
                data-testid="call-join-video"
                className={chatHeaderIconButtonClass}
              >
                <Video aria-hidden="true" className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{join.joinVideoLabel}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild={true}>
              <button
                type="button"
                aria-label={join.joinAudioLabel}
                onClick={join.onJoinAudio}
                data-testid="call-join-audio"
                className={chatHeaderIconButtonClass}
              >
                <Phone aria-hidden="true" className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{join.joinAudioLabel}</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

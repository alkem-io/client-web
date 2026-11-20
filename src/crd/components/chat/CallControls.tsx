import { Phone, Video } from 'lucide-react';
import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

/** Same footprint as the conversation's options trigger, so the header icons line up. */
export const chatHeaderIconButtonClass =
  'flex size-9 sm:size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** Phones get the larger touch-friendly icon; from the `sm` breakpoint up, the compact desktop size. */
export const chatHeaderIconClass = 'size-6 sm:size-4';
/** As `chatHeaderIconClass`, for the header glyphs whose desktop size is one step larger. */
export const chatHeaderLargeIconClass = 'size-6 sm:size-5';

type HeaderIconButtonProps = {
  label: string;
  onClick: () => void;
  testId: string;
  children: ReactNode;
};

function HeaderIconButton({ label, onClick, testId, children }: HeaderIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild={true}>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          data-testid={testId}
          className={chatHeaderIconButtonClass}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

type CallControlsProps = {
  startAudioLabel: string;
  startVideoLabel: string;
  onStartAudio: () => void;
  onStartVideo: () => void;
};

/** Start-call buttons in a conversation header: audio (camera off) and video. */
export function CallControls({ startAudioLabel, startVideoLabel, onStartAudio, onStartVideo }: CallControlsProps) {
  return (
    <div className="flex items-center" data-testid="call-controls">
      <HeaderIconButton label={startAudioLabel} onClick={onStartAudio} testId="call-start-audio">
        <Phone aria-hidden="true" className={chatHeaderIconClass} />
      </HeaderIconButton>
      <HeaderIconButton label={startVideoLabel} onClick={onStartVideo} testId="call-start-video">
        <Video aria-hidden="true" className={chatHeaderIconClass} />
      </HeaderIconButton>
    </div>
  );
}

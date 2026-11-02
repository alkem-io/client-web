import { Phone, Video } from 'lucide-react';
import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

/** Same footprint as the conversation's options trigger, so the header icons line up. */
export const chatHeaderIconButtonClass =
  'flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

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
        <Phone aria-hidden="true" className="size-4" />
      </HeaderIconButton>
      <HeaderIconButton label={startVideoLabel} onClick={onStartVideo} testId="call-start-video">
        <Video aria-hidden="true" className="size-4" />
      </HeaderIconButton>
    </div>
  );
}

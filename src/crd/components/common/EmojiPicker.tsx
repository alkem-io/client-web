import type { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { Loader2 } from 'lucide-react';
import { lazy, type ReactNode, Suspense, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';

// The library and its emoji dataset stay out of the main bundle. The download
// starts as soon as the user reaches for the trigger, so the first open does
// not wait for it.
const loadEmojiPickerLib = () => import('emoji-picker-react');
const EmojiPickerLib = lazy(loadEmojiPickerLib);

/**
 * The picker is portalled out of whatever opened it, so when it is used from
 * inside a modal dialog it lands outside the dialog's scroll lock. That lock
 * listens for `wheel` / `touchmove` on the document and cancels every gesture
 * whose target it does not recognise as its own, which leaves the emoji list
 * unscrollable — the list only ever moves when the category tabs scroll it
 * programmatically. Keeping the gesture from reaching the document lets the
 * browser scroll the list natively while the lock still guards everything else.
 */
const containScrollGesture = (event: Event) => event.stopPropagation();

const CONTAINED_SCROLL_EVENTS = ['wheel', 'touchmove'] as const;

/** Space kept between the picker and the screen edges on narrow screens. */
const SCREEN_EDGE_MARGIN_PX = 8;

// The library's natural size, capped so it fits a phone screen: the width with
// the margin on both sides, the height to the room Radix reports on the side it
// opened (less the popover's 1px borders).
const PICKER_WIDTH = `min(350px, calc(100vw - ${2 * SCREEN_EDGE_MARGIN_PX}px))`;
const PICKER_HEIGHT = 'min(450px, calc(var(--radix-popover-content-available-height, 450px) - 2px))';

const attachScrollContainment = (node: HTMLDivElement | null) => {
  if (!node) return;
  for (const type of CONTAINED_SCROLL_EVENTS) {
    node.addEventListener(type, containScrollGesture, { passive: true });
  }
  return () => {
    for (const type of CONTAINED_SCROLL_EVENTS) {
      node.removeEventListener(type, containScrollGesture);
    }
  };
};

type EmojiPickerProps = {
  onSelect: (emoji: string) => void;
  trigger: ReactNode;
  /** `reaction` opens on the library's quick-reactions bar; the full grid is one tap away. */
  mode?: 'reaction' | 'insert';
};

export function EmojiPicker({ onSelect, trigger, mode = 'insert' }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelect(emojiData.emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild={true} onPointerEnter={loadEmojiPickerLib} onFocus={loadEmojiPickerLib}>
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        collisionPadding={SCREEN_EDGE_MARGIN_PX}
        className="z-[130] w-auto border p-0 shadow-lg"
        onOpenAutoFocus={event => event.preventDefault()}
      >
        {/* `overscroll-contain` keeps a gesture that runs past either end of the
            emoji list from scrolling whatever sits behind the picker. */}
        <div
          ref={attachScrollContainment}
          data-testid="emoji-picker-scroll-container"
          className="[&_.epr-body]:overscroll-contain"
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center" style={{ width: PICKER_WIDTH, height: PICKER_HEIGHT }}>
                <Loader2 aria-hidden="true" className="size-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <EmojiPickerLib
              onEmojiClick={handleEmojiClick}
              emojiStyle={'native' as EmojiStyle}
              autoFocusSearch={false}
              lazyLoadEmojis={true}
              reactionsDefaultOpen={mode === 'reaction'}
              width={PICKER_WIDTH}
              height={PICKER_HEIGHT}
            />
          </Suspense>
        </div>
      </PopoverContent>
    </Popover>
  );
}

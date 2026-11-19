import type { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { Loader2, Plus } from 'lucide-react';
import { lazy, type ReactNode, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

// Shown first for a reaction. The library builds its whole grid even behind its
// own quick bar, so the bar is rendered here and the library only on request.
const QUICK_REACTIONS = ['👍', '❤️', '😃', '😢', '🙏', '👎', '😡'];

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
  /** `reaction` opens on a short bar of common reactions; the full grid is one tap away. */
  mode?: 'reaction' | 'insert';
};

export function EmojiPicker({ onSelect, trigger, mode = 'insert' }: EmojiPickerProps) {
  const { t } = useTranslation('crd-common');
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setExpanded(false);
  };

  const pick = (emoji: string) => {
    onSelect(emoji);
    handleOpenChange(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => pick(emojiData.emoji);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
        {mode === 'reaction' && !expanded ? (
          <div className="flex items-center gap-0.5 p-1">
            {QUICK_REACTIONS.map(emoji => (
              <button
                key={emoji}
                type="button"
                className="flex size-9 items-center justify-center rounded-full text-xl hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => pick(emoji)}
              >
                {emoji}
              </button>
            ))}
            <button
              type="button"
              aria-label={t('emojiPicker.more')}
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setExpanded(true)}
            >
              <Plus aria-hidden="true" className="size-4" />
            </button>
          </div>
        ) : (
          <>
            {/* `overscroll-contain` keeps a gesture that runs past either end of the
                emoji list from scrolling whatever sits behind the picker. */}
            <div
              ref={attachScrollContainment}
              data-testid="emoji-picker-scroll-container"
              className="[&_.epr-body]:overscroll-contain"
            >
              <Suspense
                fallback={
                  <div
                    className="flex items-center justify-center"
                    style={{ width: PICKER_WIDTH, height: PICKER_HEIGHT }}
                  >
                    <Loader2 aria-hidden="true" className="size-6 animate-spin text-muted-foreground" />
                  </div>
                }
              >
                <EmojiPickerLib
                  onEmojiClick={handleEmojiClick}
                  emojiStyle={'native' as EmojiStyle}
                  autoFocusSearch={false}
                  lazyLoadEmojis={true}
                  width={PICKER_WIDTH}
                  height={PICKER_HEIGHT}
                />
              </Suspense>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

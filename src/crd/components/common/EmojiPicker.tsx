import EmojiPickerLib, { type EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { type ReactNode, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';

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
};

export function EmojiPicker({ onSelect, trigger }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelect(emojiData.emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild={true}>{trigger}</PopoverTrigger>
      <PopoverContent side="top" align="start" className="z-[130] w-auto border p-0 shadow-lg">
        {/* `overscroll-contain` keeps a gesture that runs past either end of the
            emoji list from scrolling whatever sits behind the picker. */}
        <div
          ref={attachScrollContainment}
          data-testid="emoji-picker-scroll-container"
          className="[&_.epr-body]:overscroll-contain"
        >
          <EmojiPickerLib
            onEmojiClick={handleEmojiClick}
            emojiStyle={EmojiStyle.NATIVE}
            autoFocusSearch={false}
            lazyLoadEmojis={true}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

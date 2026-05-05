import EmojiPickerLib, { type EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { type ReactNode, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';

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
      <PopoverContent side="top" align="start" className="w-auto border p-0 shadow-lg">
        <EmojiPickerLib
          onEmojiClick={handleEmojiClick}
          emojiStyle={EmojiStyle.NATIVE}
          autoFocusSearch={false}
          lazyLoadEmojis={true}
        />
      </PopoverContent>
    </Popover>
  );
}

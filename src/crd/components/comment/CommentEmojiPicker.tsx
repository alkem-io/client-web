import EmojiPicker, { type EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';

type CommentEmojiPickerProps = {
  onSelect: (emoji: string) => void;
  trigger: ReactNode;
};

export function CommentEmojiPicker({ onSelect, trigger }: CommentEmojiPickerProps) {
  const { t } = useTranslation('crd-space');

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelect(emojiData.emoji);
  };

  return (
    <Popover>
      <PopoverTrigger asChild={true} aria-label={t('comments.reactions.add')}>
        {trigger}
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-auto border p-0 shadow-lg">
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          emojiStyle={EmojiStyle.NATIVE}
          autoFocusSearch={false}
          lazyLoadEmojis={true}
        />
      </PopoverContent>
    </Popover>
  );
}

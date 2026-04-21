import { Send, Smile } from 'lucide-react';
import type { KeyboardEventHandler } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { CommentEmojiPicker } from './CommentEmojiPicker';
import type { CommentAuthor } from './types';

type CommentInputProps = {
  currentUser?: CommentAuthor;
  onSubmit: (content: string) => void;
  disabled?: boolean;
  maxLength?: number;
};

const MAX_ROWS = 5;

export function CommentInput({ currentUser, onSubmit, disabled, maxLength = 2000 }: CommentInputProps) {
  const { t } = useTranslation('crd-space');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [content, setContent] = useState('');

  const trimmedContent = content.trim();
  const canSend = !disabled && trimmedContent.length > 0;
  const showCharCount = content.length >= Math.floor(maxLength * 0.8);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const lineHeight = Number.parseInt(window.getComputedStyle(textarea).lineHeight || '20', 10);
    const maxHeight = lineHeight * MAX_ROWS;

    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  useEffect(() => {
    resizeTextarea();
  }, [content]);

  const handleSubmit = () => {
    if (!canSend) return;

    onSubmit(trimmedContent);
    setContent('');
  };

  const handleInsertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${content.slice(0, start)}${emoji}${content.slice(end)}`;

    if (next.length > maxLength) return;

    setContent(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + emoji.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = event => {
    const shouldSubmit = event.key === 'Enter' && !event.shiftKey;
    const shouldSubmitWithCtrl = event.key === 'Enter' && (event.ctrlKey || event.metaKey);

    if (shouldSubmit || shouldSubmitWithCtrl) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        {currentUser?.avatarUrl && <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />}
        <AvatarFallback className="text-caption">{currentUser?.name?.charAt(0) ?? '?'}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-2">
        <textarea
          ref={textareaRef}
          value={content}
          disabled={disabled}
          maxLength={maxLength}
          onChange={event => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('comments.addComment')}
          className="min-h-9 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-body outline-hidden focus:border-primary/50"
          rows={1}
          aria-label={t('comments.addComment')}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CommentEmojiPicker
              onSelect={handleInsertEmoji}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={t('comments.reactions.add')}
                >
                  <Smile className="h-4 w-4" aria-hidden="true" />
                </Button>
              }
            />
            <div className="h-8 w-8" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-2">
            {showCharCount && (
              <span className="text-caption text-muted-foreground">
                {t('comments.charCount', { count: content.length, max: maxLength })}
              </span>
            )}
            <Button
              type="button"
              size="icon"
              className="h-8 w-8"
              disabled={!canSend}
              onClick={handleSubmit}
              aria-label={t('comments.send')}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

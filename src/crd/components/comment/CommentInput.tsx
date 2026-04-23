import { AtSign, Send, Smile } from 'lucide-react';
import { type CSSProperties, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mention, MentionsInput, type SuggestionDataItem } from 'react-mentions';
import { useScreenSize } from '@/crd/hooks/useMediaQuery';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { CommentEmojiPicker } from './CommentEmojiPicker';
import { MentionSuggestionItem } from './MentionSuggestionItem';
import type { CommentAuthor, CrdMentionSearch, CrdMentionSuggestion } from './types';

type CommentInputProps = {
  currentUser?: CommentAuthor;
  onSubmit: (content: string) => void;
  disabled?: boolean;
  maxLength?: number;
  /**
   * Async `@`-lookup callback wired by the integration layer. When omitted the
   * input falls back to a plain textarea (standalone preview + any non-space
   * surface that can't provide a contributor search).
   */
  mentionSearch?: CrdMentionSearch;
};

type EnrichedSuggestion = SuggestionDataItem & CrdMentionSuggestion;

const MAX_ROWS = 5;
const MENTION_MARKUP = '[@__display__](__id__)';

// react-mentions renders an overlay + textarea stack. These inline styles
// neutralize its defaults so the textarea blends with the surrounding Tailwind
// bordered container (no double borders, transparent background).
const mentionsInputStyle = {
  control: {
    minHeight: 24,
    backgroundColor: 'transparent',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    lineHeight: 'inherit',
  } satisfies CSSProperties,
  highlighter: {
    padding: '4px 4px',
    border: 'none',
  } satisfies CSSProperties,
  input: {
    padding: '4px 4px',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    resize: 'none',
    overflow: 'hidden',
  } satisfies CSSProperties,
  suggestions: {
    list: {
      backgroundColor: 'transparent',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    } satisfies CSSProperties,
    item: {
      padding: 0,
    } satisfies CSSProperties,
  },
};

const mentionStyle: CSSProperties = {
  color: 'var(--primary)',
  fontWeight: 500,
};

export function CommentInput({ currentUser, onSubmit, disabled, maxLength = 2000, mentionSearch }: CommentInputProps) {
  const { t } = useTranslation('crd-space');
  const { isSmallScreen } = useScreenSize();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [content, setContent] = useState('');

  const trimmedContent = content.trim();
  const canSend = !disabled && trimmedContent.length > 0;
  const showCharCount = content.length >= Math.floor(maxLength * 0.8);
  const mentionsEnabled = Boolean(mentionSearch);

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

  const insertAtCursor = (insertion: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${content.slice(0, start)}${insertion}${content.slice(end)}`;

    if (next.length > maxLength) return;

    setContent(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + insertion.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLInputElement>) => {
    const shouldSubmit = event.key === 'Enter' && !event.shiftKey;
    const shouldSubmitWithCtrl = event.key === 'Enter' && (event.ctrlKey || event.metaKey);

    if (shouldSubmit || shouldSubmitWithCtrl) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleMentionSearch = async (query: string, callback: (items: EnrichedSuggestion[]) => void) => {
    if (!mentionSearch) return callback([]);
    const results = await mentionSearch(query);
    callback(
      results.map(suggestion => ({
        id: suggestion.id,
        display: suggestion.displayName,
        avatarUrl: suggestion.avatarUrl,
        city: suggestion.city,
        country: suggestion.country,
        virtualContributor: suggestion.virtualContributor,
        displayName: suggestion.displayName,
      }))
    );
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        {currentUser?.avatarUrl && <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />}
        <AvatarFallback className="text-caption">{currentUser?.name?.charAt(0) ?? '?'}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-end gap-1 rounded-md border border-border bg-background px-2 py-1.5 transition-colors focus-within:border-primary/50">
          {mentionsEnabled ? (
            <div className="min-h-6 min-w-0 flex-1 text-body [&_textarea]:placeholder:text-muted-foreground">
              <MentionsInput
                value={content}
                onChange={(_event, newValue) => setContent(newValue)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                maxLength={maxLength}
                placeholder={t('comments.addComment')}
                aria-label={t('comments.addComment')}
                allowSpaceInQuery={true}
                forceSuggestionsAboveCursor={true}
                style={mentionsInputStyle}
                inputRef={(input: HTMLTextAreaElement | null) => {
                  textareaRef.current = input;
                }}
                customSuggestionsContainer={children => {
                  // On phones react-mentions' cursor-anchored popover often
                  // spills past the viewport edge. Position the dropdown as a
                  // fixed overlay anchored just above the input's top so it
                  // stays near the text the user is typing while still being
                  // fully tappable.
                  let mobileStyle: CSSProperties | undefined;
                  if (isSmallScreen) {
                    const rect = textareaRef.current?.getBoundingClientRect();
                    const inputTop = rect?.top ?? 0;
                    mobileStyle = {
                      position: 'fixed',
                      left: '0.5rem',
                      right: '0.5rem',
                      bottom: `calc(100vh - ${Math.max(inputTop, 80) - 4}px)`,
                      maxHeight: '14rem',
                      zIndex: 50,
                    };
                  }

                  return (
                    <div
                      className={cn(
                        'overflow-y-auto rounded-md border border-border bg-popover shadow-md',
                        !isSmallScreen && 'max-h-72 w-72 max-w-[calc(100vw-1rem)]'
                      )}
                      style={mobileStyle}
                    >
                      {children}
                    </div>
                  );
                }}
              >
                <Mention
                  trigger="@"
                  data={handleMentionSearch}
                  appendSpaceOnAdd={true}
                  markup={MENTION_MARKUP}
                  displayTransform={(_id, display) => `@${display}`}
                  style={mentionStyle}
                  renderSuggestion={(suggestion, _search, _highlighted, _index, focused) => (
                    <MentionSuggestionItem suggestion={suggestion as EnrichedSuggestion} focused={focused} />
                  )}
                />
              </MentionsInput>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              disabled={disabled}
              maxLength={maxLength}
              onChange={event => setContent(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('comments.addComment')}
              className="min-h-6 min-w-0 flex-1 resize-none bg-transparent px-1 py-1 text-body outline-hidden placeholder:text-muted-foreground"
              rows={1}
              aria-label={t('comments.addComment')}
            />
          )}

          <div className="flex shrink-0 items-center gap-0.5 pb-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground md:h-7 md:w-7"
              disabled={disabled}
              onClick={() => insertAtCursor('@')}
              aria-label={t('comments.mention')}
            >
              <AtSign className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
            </Button>
            <CommentEmojiPicker
              onSelect={insertAtCursor}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground md:h-7 md:w-7"
                  disabled={disabled}
                  aria-label={t('comments.reactions.add')}
                >
                  <Smile className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
                </Button>
              }
            />
            <Button
              type="button"
              size="icon"
              className="h-6 w-6 md:h-7 md:w-7"
              disabled={!canSend}
              onClick={handleSubmit}
              aria-label={t('comments.send')}
            >
              <Send className="h-3 w-3 md:h-3.5 md:w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {showCharCount && (
          <div className="mt-1 text-right text-caption text-muted-foreground">
            {t('comments.charCount', { count: content.length, max: maxLength })}
          </div>
        )}
      </div>
    </div>
  );
}

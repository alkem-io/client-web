import { AtSign, Loader2, Paperclip, Send, Smile, X } from 'lucide-react';
import { type CSSProperties, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mention, MentionsInput, type SuggestionDataItem } from 'react-mentions';
import { EmojiPicker } from '@/crd/components/common/EmojiPicker';
import { useScreenSize } from '@/crd/hooks/useMediaQuery';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { MentionSuggestionItem } from './MentionSuggestionItem';
import type { CommentAuthor, ComposerAttachment, CrdMentionSearch, CrdMentionSuggestion } from './types';

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
  /**
   * When true, focus the textarea and scroll it into view on mount. Used by the
   * per-comment reply input: it renders at the end of the parent's reply group,
   * so on a comment with many replies it lands below the fold — without this the
   * user clicks Reply and sees nothing until they scroll down. The top-level
   * input leaves this off so the page doesn't jump to the box on load.
   */
  autoFocus?: boolean;
  /**
   * Enables the attach-file affordance (feature 013). Only the conversation
   * composer opts in this round; comment/post composers leave it off and render
   * exactly as before. When true a paperclip button + preview chips appear and
   * the message can be sent with attachments only (no text required).
   */
  attachmentsEnabled?: boolean;
  /** Currently staged attachments (with their upload lifecycle state). */
  attachments?: ComposerAttachment[];
  /** User picked one or more files via the attach button. */
  onAttachFiles?: (files: File[]) => void;
  /** User removed a staged attachment chip. */
  onRemoveAttachment?: (id: string) => void;
  /** A localized validation / upload error to surface under the composer. */
  attachmentError?: string;
  /** `accept` attribute for the file picker, derived from the bucket policy. */
  acceptMimeTypes?: string;
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

// `react-mentions` paints the styled mention chip in an overlay layer on top
// of the underlying textarea, and BOTH layers paint their text (it relies on
// pixel-perfect alignment to look like one). Any property that changes glyph
// width on the overlay but not on the textarea — font-weight, font-size,
// font-family — desyncs the two layers and the typed mention shows up
// blurry/doubled. Keep this to non-metric-affecting properties only
// (color + background-color are safe).
const mentionStyle: CSSProperties = {
  color: 'var(--primary)',
  backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
  borderRadius: 4,
};

export function CommentInput({
  currentUser,
  onSubmit,
  disabled,
  maxLength = 2000,
  mentionSearch,
  autoFocus,
  attachmentsEnabled = false,
  attachments = [],
  onAttachFiles,
  onRemoveAttachment,
  attachmentError,
  acceptMimeTypes,
}: CommentInputProps) {
  const { t } = useTranslation('crd-space');
  const { isSmallScreen } = useScreenSize();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [content, setContent] = useState('');

  const trimmedContent = content.trim();
  const anyUploading = attachments.some(attachment => attachment.status === 'uploading');
  const readyAttachmentCount = attachments.filter(attachment => attachment.status === 'ready').length;
  // With attachments enabled, an attachment-only message (no text) is valid;
  // block sending while any upload is still in flight.
  const canSend =
    !disabled && !anyUploading && (trimmedContent.length > 0 || (attachmentsEnabled && readyAttachmentCount > 0));
  const showCharCount = content.length >= Math.floor(maxLength * 0.8);
  const mentionsEnabled = Boolean(mentionSearch);

  const handleFilesPicked = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onAttachFiles?.(Array.from(fileList));
    // Reset so picking the same file again re-triggers onChange.
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  // Reply input opens at the end of a (possibly long) reply group — reveal it
  // and place the cursor so the user can type immediately. `preventScroll` on
  // focus lets the explicit smooth scroll own the motion instead of the
  // browser's instant default scroll fighting it.
  useEffect(() => {
    if (!autoFocus) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus({ preventScroll: true });
    textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [autoFocus]);

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
        {attachmentsEnabled && attachments.length > 0 && (
          <ul aria-label={t('comments.attachments.attach')} className="mb-1.5 flex flex-wrap gap-1.5">
            {attachments.map(attachment => (
              <li
                key={attachment.id}
                className={cn(
                  'flex max-w-[12rem] items-center gap-1.5 rounded-md border border-border bg-muted/40 py-1 pl-2 pr-1 text-caption',
                  attachment.status === 'error' && 'border-destructive/50 text-destructive'
                )}
              >
                {attachment.status === 'uploading' ? (
                  <Loader2
                    aria-label={t('comments.attachments.uploading')}
                    className="size-3.5 shrink-0 animate-spin"
                  />
                ) : (
                  <Paperclip aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment?.(attachment.id)}
                  aria-label={t('comments.attachments.removeAttachment', { name: attachment.name })}
                  className="flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
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
            {attachmentsEnabled && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={true}
                  accept={acceptMimeTypes}
                  className="hidden"
                  onChange={event => handleFilesPicked(event.target.files)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground md:h-7 md:w-7"
                  disabled={disabled}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label={t('comments.attachments.attach')}
                >
                  <Paperclip className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
                </Button>
              </>
            )}
            {mentionsEnabled && (
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
            )}
            <EmojiPicker
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

        {attachmentsEnabled && attachmentError && (
          <p role="alert" className="mt-1 text-caption text-destructive">
            {attachmentError}
          </p>
        )}
      </div>
    </div>
  );
}

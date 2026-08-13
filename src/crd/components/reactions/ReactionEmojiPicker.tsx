import { Smile } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';
import { glyphForSlug } from './reactionEmoji';

export type ReactionEmojiPickerProps = {
  /** Server-provided list of allowed emoji slugs. The picker renders exactly
   *  these — no hardcoded list. Unknown slugs are silently skipped. */
  allowedEmojis: string[];
  /** The slug of the viewer's current reaction, if any. Highlighted in the grid. */
  currentEmoji?: string | null;
  /** Called when the viewer picks an emoji slug from the grid. */
  onSelect: (slug: string) => void;
};

/**
 * A restricted emoji picker that renders exactly the server-provided allowed
 * set. Opens on hover, focus, or click/tap — all three paths are supported so
 * both mouse and touch users can access it.
 *
 * This component NEVER uses the full emoji-picker-react library: it renders only
 * the platform-defined positive set. A free-form emoji search is absent by design.
 */
export function ReactionEmojiPicker({ allowedEmojis, currentEmoji, onSelect }: ReactionEmojiPickerProps) {
  const { t } = useTranslation('crd-reactions');
  const [open, setOpen] = useState(false);

  const renderable = allowedEmojis
    .map(slug => ({ slug, glyph: glyphForSlug(slug) }))
    .filter((e): e is { slug: string; glyph: string } => e.glyph !== undefined);

  const handleSelect = (slug: string) => {
    onSelect(slug);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild={true}>
        {/* Ghost button matching the CommentItem add-reaction trigger visual */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-caption text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('addReaction')}
          aria-expanded={open}
          aria-haspopup="true"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          <Smile className="size-3.5" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-auto p-2"
        aria-label={t('pickerAriaLabel')}
        onOpenAutoFocus={event => event.preventDefault()}
      >
        <p className="mb-2 text-caption text-muted-foreground font-medium px-1">{t('pickerTitle')}</p>
        <div role="listbox" aria-label={t('pickerAriaLabel')} className="flex flex-wrap gap-1">
          {renderable.map(({ slug, glyph }) => (
            <button
              key={slug}
              type="button"
              role="option"
              aria-selected={currentEmoji === slug}
              className={cn(
                'flex items-center justify-center rounded-md p-1.5 text-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-muted',
                currentEmoji === slug && 'bg-primary/10 ring-1 ring-primary/50'
              )}
              onMouseDown={event => {
                // Prevent the trigger's onBlur from closing the picker before the
                // click registers.
                event.preventDefault();
              }}
              onClick={() => handleSelect(slug)}
              aria-label={slug}
            >
              <span aria-hidden="true">{glyph}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

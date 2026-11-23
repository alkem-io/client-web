import { Check, Pencil, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';

type OwnStatusMessageProps = {
  /** The signed-in user's status message; empty when they set none. */
  statusMessage: string;
  /** Saves a new status message; an empty one clears it. */
  onSave: (statusMessage: string) => void;
};

/**
 * The signed-in user's status message, which others see on their avatar card.
 * A press edits it in place: Enter or the check saves, Escape or the cross cancels.
 */
export function OwnStatusMessage({ statusMessage, onSave }: OwnStatusMessageProps) {
  const { t } = useTranslation('crd-chat');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEditing = () => {
    setDraft(statusMessage);
    setEditing(true);
  };

  const save = () => {
    setEditing(false);
    onSave(draft.trim());
  };

  if (editing) {
    return (
      <form
        className="flex shrink-0 flex-col gap-1 px-3 pt-2"
        onSubmit={event => {
          event.preventDefault();
          save();
        }}
      >
        <div className="flex items-center gap-1">
          <Input
            value={draft}
            onChange={event => setDraft(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Escape') {
                // Claimed, so the chat panel does not also step back or close.
                event.preventDefault();
                setEditing(false);
              }
            }}
            maxLength={100}
            autoFocus={true}
            placeholder={t('status.placeholder')}
            aria-label={t('status.label')}
            className="h-8"
          />
          <Button type="submit" variant="ghost" size="icon" className="size-8 shrink-0" aria-label={t('status.save')}>
            <Check aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => setEditing(false)}
            aria-label={t('actions.cancel')}
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <p className="px-1 text-caption text-muted-foreground">{t('status.hint')}</p>
      </form>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1 px-3 pt-2">
      <button
        type="button"
        onClick={startEditing}
        aria-label={statusMessage ? t('status.edit', { status: statusMessage }) : undefined}
        className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-left text-caption hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Pencil aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
        <span className={cn('truncate', statusMessage ? 'text-foreground' : 'text-muted-foreground')}>
          {statusMessage || t('status.set')}
        </span>
      </button>
      {statusMessage && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground"
          onClick={() => onSave('')}
          aria-label={t('status.clear')}
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Textarea } from '@/crd/primitives/textarea';

type UseMessageComposerOptions = {
  /** Resolved promise = success (draft cleared, `onSent` called); rejection = failure (draft kept, error shown). */
  onSendMessage: (messageText: string) => Promise<void>;
  onSent: () => void;
};

/**
 * Draft / sending / error state shared by every compose surface
 * (`MessagePopover`, `MessageDialog`). The container only decides how it opens
 * and closes; it renders `MessageComposerFields` + `MessageComposerActions`
 * with the returned state.
 */
export function useMessageComposer({ onSendMessage, onSent }: UseMessageComposerOptions) {
  const { t } = useTranslation('crd-profilePages');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setDraft('');
    setError(null);
    setSending(false);
  };

  const send = async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSendMessage(trimmed);
      reset();
      onSent();
    } catch (err) {
      setSending(false);
      setError(err instanceof Error ? err.message : t('common.messagePopover.errorTitle'));
    }
  };

  return { draft, setDraft, sending, error, isDirty: draft.trim().length > 0, send, reset };
}

export type MessageComposerState = ReturnType<typeof useMessageComposer>;

type MessageComposerFieldsProps = {
  composer: MessageComposerState;
  notice: string;
  placeholder: string;
};

export function MessageComposerFields({ composer, notice, placeholder }: MessageComposerFieldsProps) {
  const { t } = useTranslation('crd-profilePages');
  const { draft, setDraft, sending, error, send } = composer;

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          // Cmd+Enter on macOS, Ctrl+Enter elsewhere — same key event in
          // both cases (metaKey on mac, ctrlKey otherwise). Submitting on
          // a chord rather than plain Enter lets the user keep typing
          // multi-line drafts without an accidental send.
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            send();
          }
        }}
        placeholder={placeholder}
        className="min-h-24"
        disabled={sending}
        aria-label={t('common.messagePopover.ariaLabel')}
      />
      <p className="text-caption text-muted-foreground">{notice}</p>
      {error ? (
        <p role="alert" className="text-caption text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type MessageComposerActionsProps = {
  composer: MessageComposerState;
  onCancel: () => void;
  size?: 'default' | 'sm';
};

export function MessageComposerActions({ composer, onCancel, size = 'default' }: MessageComposerActionsProps) {
  const { t } = useTranslation('crd-profilePages');
  const { sending, isDirty, send } = composer;

  return (
    <>
      <Button type="button" variant="ghost" size={size} onClick={onCancel} disabled={sending}>
        {t('common.messagePopover.cancel')}
      </Button>
      <Button type="button" size={size} onClick={send} disabled={!isDirty || sending} aria-busy={sending}>
        {sending ? t('common.messagePopover.sending') : t('common.messagePopover.send')}
      </Button>
    </>
  );
}

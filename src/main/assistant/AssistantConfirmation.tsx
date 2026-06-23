import { CirclePlus, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { type ConfirmationPart, ProposedWriteKind } from './types';

/**
 * The consolidated, itemized write proposal (US2 / FR-015): each
 * `{ toolName, kind, summary, targetRef? }` item is listed and a **single**
 * Approve / Decline control covers the whole set. Nothing changes until the user
 * approves; declining ends the turn with no change (SC-002). Destructive items
 * are flagged so the user sees what may be overwritten.
 *
 * The decision is posted by the consumer (`useAssistantConversation`
 * .submitConfirmationDecision), which resumes the same SSE protocol; on
 * approve the results stream in, a stale destructive target yields a fresh
 * `confirmation-request` (which replaces this part), and an expired/invalid set
 * surfaces the "please re-ask" message (handled by the error UI).
 */
export const AssistantConfirmation = ({
  part,
  disabled,
  onApprove,
  onDecline,
}: {
  part: ConfirmationPart;
  /** True while a decision is in flight (avoids double-submit). */
  disabled: boolean;
  onApprove: () => void;
  onDecline: () => void;
}) => {
  const { t } = useTranslation();

  return (
    // biome-ignore lint/a11y/useSemanticElements: a labelled write-proposal is a generic grouping; <fieldset> is for form-control grouping and is not a valid substitute.
    <div
      className="flex flex-col gap-2 rounded-lg border border-amber-500 p-3"
      role="group"
      aria-label={t('assistant.confirmation.title')}
    >
      <span className="text-body-emphasis">{t('assistant.confirmation.title')}</span>
      <span className="text-caption text-muted-foreground">{t('assistant.confirmation.description')}</span>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {part.items.map((item, index) => {
          const isDestructive = item.kind === ProposedWriteKind.WriteDestructive;
          return (
            <li key={`${item.toolName}-${index}`} className="flex items-start gap-2">
              {isDestructive ? (
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden={true} />
              ) : (
                <CirclePlus className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden={true} />
              )}
              <div className="flex flex-col">
                <span className="text-body">{item.summary}</span>
                {isDestructive && (
                  <span className="text-caption text-amber-600">{t('assistant.confirmation.destructiveItem')}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-1 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDecline} disabled={disabled}>
          {t('assistant.confirmation.decline')}
        </Button>
        <Button size="sm" onClick={onApprove} disabled={disabled}>
          {t('assistant.confirmation.approve')}
        </Button>
      </div>
    </div>
  );
};

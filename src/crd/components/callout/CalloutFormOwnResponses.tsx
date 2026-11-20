import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { answerDisplayValue, deriveFormColumns } from '@/crd/components/callout/calloutFormColumns';
import type { FormQuestionView, FormResponseView } from '@/crd/components/callout/calloutFormTypes';
import { formatFormDate } from '@/crd/components/callout/formatFormDate';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

/** An own response, with its 1-based position among all of the viewer's responses when not contiguous. */
export type OwnFormResponseView = FormResponseView & { number?: number };

type CalloutFormOwnResponsesProps = {
  responses: OwnFormResponseView[];
  questions: FormQuestionView[];
  onWithdraw: (responseId: string) => void;
  /** True while a withdrawal is in flight. */
  withdrawing?: boolean;
  /**
   * Form state to explain when the fill-in is not rendered (single-response mode after responding); the
   * Form box header carries the matching badge.
   */
  status?: 'CLOSED' | 'DRAFT';
  /** Shown when the viewer has earlier responses than the ones listed; loads the next page of them. */
  onLoadEarlier?: () => void;
  loadingEarlier?: boolean;
  className?: string;
};

/** The viewer's own responses, read-only, each with a withdraw action. */
export function CalloutFormOwnResponses({
  responses,
  questions,
  onWithdraw,
  withdrawing = false,
  status,
  onLoadEarlier,
  loadingEarlier = false,
  className,
}: CalloutFormOwnResponsesProps) {
  const { t, i18n } = useTranslation('crd-space');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const confirmWithdraw = () => {
    if (!pendingDeleteId) return;
    onWithdraw(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-body-emphasis text-foreground">{t('formFillIn.ownResponses.heading')}</h3>
      {status && (
        <p className="text-caption text-muted-foreground">
          {status === 'DRAFT' ? t('formFillIn.draftNotice') : t('formFillIn.closedNotice')}
        </p>
      )}
      {onLoadEarlier && (
        <Button
          variant="ghost"
          size="sm"
          disabled={loadingEarlier}
          aria-busy={loadingEarlier || undefined}
          onClick={onLoadEarlier}
        >
          {t('formFillIn.ownResponses.loadEarlier')}
        </Button>
      )}
      {responses.map((response, index) => {
        const columns = deriveFormColumns(questions, [response]);
        return (
          <section key={response.id} className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-body-emphasis">
                  {t('formFillIn.ownResponses.responseNumber', { number: response.number ?? index + 1 })}
                </p>
                <p className="text-caption text-muted-foreground">
                  {t('formFillIn.ownResponses.submittedOn', {
                    date: formatFormDate(response.createdDate, i18n?.language),
                  })}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={withdrawing}
                onClick={() => setPendingDeleteId(response.id)}
              >
                {t('formFillIn.ownResponses.withdraw')}
              </Button>
            </div>
            <dl className="space-y-3">
              {columns.map(column => {
                const answer = response.answers.find(a => a.questionID === column.questionID);
                const value = answerDisplayValue(answer);
                return (
                  <div key={column.questionID} className="space-y-0.5">
                    <dt className="text-caption text-muted-foreground">{column.prompt}</dt>
                    <dd
                      className={cn(
                        'text-body whitespace-pre-wrap break-words',
                        !value && 'text-muted-foreground italic'
                      )}
                    >
                      {value ?? t('formFillIn.noAnswer')}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        );
      })}

      <ConfirmationDialog
        open={pendingDeleteId !== null}
        onOpenChange={open => {
          if (!open) setPendingDeleteId(null);
        }}
        title={t('formFillIn.ownResponses.withdrawConfirm.title')}
        description={t('formFillIn.ownResponses.withdrawConfirm.description')}
        confirmLabel={t('formFillIn.ownResponses.withdrawConfirm.confirm')}
        variant="destructive"
        onConfirm={confirmWithdraw}
      />
    </div>
  );
}

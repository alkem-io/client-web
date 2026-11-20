import { Check, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RespondentCell } from '@/crd/components/callout/CalloutFormResponsesTable';
import { answerDisplayValue, type FormColumn } from '@/crd/components/callout/calloutFormColumns';
import type { FormAnswerView, FormResponseView } from '@/crd/components/callout/calloutFormTypes';
import { formatFormDate } from '@/crd/components/callout/formatFormDate';
import {
  formOptionRowClass,
  formQuestionCardClass,
  formQuestionPromptClass,
} from '@/crd/components/callout/formStyles';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { isChoiceKind } from '@/crd/forms/callout/formValues';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogTitle } from '@/crd/primitives/dialog';
import { Separator } from '@/crd/primitives/separator';

type CalloutFormResponseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: FormResponseView | null;
  /** The Form's title (or the generic "Form"), shown as heading context. */
  formTitle: string;
  columns: FormColumn[];
  canModerate: boolean;
  onDelete: (responseId: string) => void;
  deletedUserLabel: string;
};

function AnswerValue({ answer }: { answer: FormAnswerView | undefined }) {
  const { t } = useTranslation('crd-space');
  const value = answerDisplayValue(answer);
  if (!answer || !value) {
    return <p className="text-body italic text-muted-foreground">{t('formResponses.noAnswer')}</p>;
  }

  if (isChoiceKind(answer.type)) {
    const multiple = answer.type === 'MULTIPLE_CHOICE';
    return (
      <ul className="m-0 grid list-none gap-2 p-0">
        {answer.selectedLabels.map(label => (
          <li key={label} className={formOptionRowClass(true, false)}>
            {multiple ? (
              <span
                aria-hidden="true"
                className="flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-primary text-primary-foreground"
              >
                <Check className="size-3.5" />
              </span>
            ) : (
              <span aria-hidden="true" className="size-4 shrink-0 rounded-full border-[5px] border-primary bg-card" />
            )}
            {label}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="rounded-[8px] border border-border bg-card px-3 py-2 text-body text-foreground whitespace-pre-wrap break-words">
      {value}
    </p>
  );
}

/** One response in full: respondent, date and every answer against its question. */
export function CalloutFormResponseDialog({
  open,
  onOpenChange,
  response,
  formTitle,
  columns,
  canModerate,
  onDelete,
  deletedUserLabel,
}: CalloutFormResponseDialogProps) {
  const { t, i18n } = useTranslation('crd-space');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    onDelete(pendingDeleteId);
    setPendingDeleteId(null);
    onOpenChange(false);
  };

  const respondentName = response?.respondent?.name ?? deletedUserLabel;

  return (
    <>
      <Dialog open={open && response !== null} onOpenChange={onOpenChange}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="shrink-0 space-y-0.5">
            <p className="text-caption text-muted-foreground break-words">{formTitle}</p>
            <DialogTitle className="text-subsection-title">
              {t('formResponses.singleTitle', { name: respondentName })}
            </DialogTitle>
          </div>
          <Separator className="shrink-0" />
          {response && (
            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <RespondentCell response={response} deletedUserLabel={deletedUserLabel} />
                <span className="text-caption text-muted-foreground">
                  {formatFormDate(response.createdDate, i18n?.language)}
                </span>
              </div>
              <dl className="space-y-4">
                {columns.map((column, index) => {
                  const answer = response.answers.find(a => a.questionID === column.questionID);
                  return (
                    <div key={column.questionID} className={formQuestionCardClass}>
                      <dt className={formQuestionPromptClass}>
                        <span>{index + 1}.</span>
                        <span>
                          {column.prompt}
                          {column.removed && (
                            <span className="text-caption text-muted-foreground">
                              {' '}
                              ({t('formResponses.removedQuestion')})
                            </span>
                          )}
                        </span>
                      </dt>
                      <dd className="m-0">
                        <AnswerValue answer={answer} />
                      </dd>
                    </div>
                  );
                })}
              </dl>
              {canModerate && (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setPendingDeleteId(response.id)}>
                    <Trash2 className="size-4" aria-hidden="true" />
                    {t('formResponses.delete')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        open={pendingDeleteId !== null}
        onOpenChange={next => {
          if (!next) setPendingDeleteId(null);
        }}
        title={t('formResponses.deleteConfirm.title')}
        description={t('formResponses.deleteConfirm.description')}
        confirmLabel={t('formResponses.deleteConfirm.confirm')}
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}

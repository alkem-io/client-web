import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RespondentCell } from '@/crd/components/callout/CalloutFormResponsesTable';
import { answerDisplayValue, type FormColumn } from '@/crd/components/callout/calloutFormColumns';
import type { FormResponseView } from '@/crd/components/callout/calloutFormTypes';
import { formatFormDate } from '@/crd/components/callout/formatFormDate';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogTitle } from '@/crd/primitives/dialog';
import { Separator } from '@/crd/primitives/separator';

type CalloutFormResponseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: FormResponseView | null;
  columns: FormColumn[];
  canModerate: boolean;
  onDelete: (responseId: string) => void;
  deletedUserLabel: string;
};

/** One response in full: respondent, date and every answer against its question. */
export function CalloutFormResponseDialog({
  open,
  onOpenChange,
  response,
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
        <DialogContent aria-describedby={undefined} className="sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogTitle className="text-subsection-title shrink-0">
            {t('formResponses.singleTitle', { name: respondentName })}
          </DialogTitle>
          <Separator className="shrink-0" />
          {response && (
            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <RespondentCell response={response} deletedUserLabel={deletedUserLabel} />
                <span className="text-caption text-muted-foreground">
                  {formatFormDate(response.createdDate, i18n?.language)}
                </span>
              </div>
              <dl className="space-y-3">
                {columns.map(column => {
                  const value = answerDisplayValue(response.answers.find(a => a.questionID === column.questionID));
                  return (
                    <div key={column.questionID} className="space-y-0.5">
                      <dt className="text-caption text-muted-foreground">
                        {column.prompt}
                        {column.removed && <> ({t('formResponses.removedQuestion')})</>}
                      </dt>
                      <dd
                        className={cn(
                          'text-body whitespace-pre-wrap break-words',
                          !value && 'italic text-muted-foreground'
                        )}
                      >
                        {value ?? t('formResponses.noAnswer')}
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

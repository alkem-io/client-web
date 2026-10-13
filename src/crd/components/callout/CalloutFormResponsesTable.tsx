import { Eye, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { answerDisplayValue, type FormColumn } from '@/crd/components/callout/calloutFormColumns';
import type { FormResponseView } from '@/crd/components/callout/calloutFormTypes';
import { formatFormDate } from '@/crd/components/callout/formatFormDate';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/crd/primitives/table';

type CalloutFormResponsesTableProps = {
  columns: FormColumn[];
  responses: FormResponseView[];
  total: number;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  canModerate: boolean;
  onDelete: (responseId: string) => void;
  onOpen: (responseId: string) => void;
  /** Shown instead of a name when the respondent's account no longer exists. */
  deletedUserLabel: string;
  className?: string;
};

export function RespondentCell({
  response,
  deletedUserLabel,
}: {
  response: FormResponseView;
  deletedUserLabel: string;
}) {
  const respondent = response.respondent;
  if (!respondent) {
    return <span className="italic text-muted-foreground">{deletedUserLabel}</span>;
  }
  return (
    <span className="flex items-center gap-2">
      <Avatar className="size-6">
        {respondent.avatarUrl && <AvatarImage src={respondent.avatarUrl} alt="" />}
        <AvatarFallback>{respondent.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <span className="truncate">{respondent.name}</span>
    </span>
  );
}

export function CalloutFormResponsesTable({
  columns,
  responses,
  total,
  hasMore,
  loadingMore,
  onLoadMore,
  canModerate,
  onDelete,
  onOpen,
  deletedUserLabel,
  className,
}: CalloutFormResponsesTableProps) {
  const { t, i18n } = useTranslation('crd-space');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    onDelete(pendingDeleteId);
    setPendingDeleteId(null);
  };

  if (responses.length === 0) {
    return <p className={cn('text-body text-muted-foreground', className)}>{t('formResponses.empty')}</p>;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Native overflow so both scrollbars stay visible: the table grows wider than a phone screen. */}
      <div className="max-h-[60vh] overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-40">{t('formResponses.respondent')}</TableHead>
              <TableHead className="min-w-36">{t('formResponses.submitted')}</TableHead>
              {columns.map(column => (
                <TableHead key={column.questionID} className="min-w-40 max-w-64 whitespace-normal">
                  {column.prompt}
                  {column.removed && (
                    <span className="ml-1 text-caption font-normal text-muted-foreground">
                      ({t('formResponses.removedQuestion')})
                    </span>
                  )}
                </TableHead>
              ))}
              <TableHead className="w-24 text-right">
                <span className="sr-only">{t('formResponses.actions')}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map(response => (
              <TableRow key={response.id}>
                <TableCell>
                  <RespondentCell response={response} deletedUserLabel={deletedUserLabel} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatFormDate(response.createdDate, i18n?.language)}
                </TableCell>
                {columns.map(column => {
                  const value = answerDisplayValue(response.answers.find(a => a.questionID === column.questionID));
                  return (
                    <TableCell key={column.questionID} className="max-w-64 align-top whitespace-normal">
                      {value ? (
                        <span className="line-clamp-3 break-words">{value}</span>
                      ) : (
                        <span className="italic text-muted-foreground">{t('formResponses.noAnswer')}</span>
                      )}
                    </TableCell>
                  );
                })}
                <TableCell className="text-right whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onOpen(response.id)}
                    aria-label={t('formResponses.open')}
                  >
                    <Eye className="size-4" aria-hidden="true" />
                  </Button>
                  {canModerate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setPendingDeleteId(response.id)}
                      aria-label={t('formResponses.delete')}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-caption text-muted-foreground">
          {t('formResponses.showing', { shown: responses.length, total })}
        </span>
        {hasMore && (
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {loadingMore ? t('formResponses.loadingMore') : t('formResponses.loadMore')}
          </Button>
        )}
      </div>

      <ConfirmationDialog
        open={pendingDeleteId !== null}
        onOpenChange={open => {
          if (!open) setPendingDeleteId(null);
        }}
        title={t('formResponses.deleteConfirm.title')}
        description={t('formResponses.deleteConfirm.description')}
        confirmLabel={t('formResponses.deleteConfirm.confirm')}
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { ApplicationQuestion } from './ApplicationFormEditor';

type ApplicationFormPreviewProps = {
  questions: ApplicationQuestion[];
  loading?: boolean;
  onEdit: () => void;
};

/** Read-only summary of the application form's questions, with Edit (opens the editor dialog). */
export function ApplicationFormPreview({ questions, loading, onEdit }: ApplicationFormPreviewProps) {
  const { t } = useTranslation('crd-spaceSettings');

  return (
    <div className="space-y-3">
      {loading ? (
        <output aria-busy={true} className="block space-y-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </output>
      ) : questions.length === 0 ? (
        <p className="text-body text-muted-foreground">{t('settings.applicationForm.noQuestions')}</p>
      ) : (
        <ol className="space-y-2">
          {questions.map((q, index) => (
            <li key={q.sortOrder} className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-caption font-bold text-primary">
                  {t('community.applicationForm.questionNumber', { number: index + 1 })}
                </span>
                <span className="text-body">{q.question}</span>
              </div>
              <Badge variant={q.required ? 'secondary' : 'outline'} className="shrink-0">
                {q.required ? t('settings.applicationForm.required') : t('community.applicationForm.optional')}
              </Badge>
            </li>
          ))}
        </ol>
      )}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onEdit} disabled={loading}>
          <Pencil aria-hidden="true" className="size-4" />
          {t('community.applicationForm.edit')}
        </Button>
      </div>
    </div>
  );
}

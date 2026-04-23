import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Checkbox } from '@/crd/primitives/checkbox';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';

export type ApplicationQuestion = {
  question: string;
  required: boolean;
  sortOrder: number;
};

export type ApplicationFormEditorProps = {
  description: string;
  questions: ApplicationQuestion[];
  loading?: boolean;
  canSave: boolean;
  onDescriptionChange: (value: string) => void;
  onQuestionChange: (index: number, value: string) => void;
  onQuestionRequiredChange: (index: number, required: boolean) => void;
  onQuestionAdd: () => void;
  onQuestionDelete: (index: number) => void;
  onQuestionMoveUp: (index: number) => void;
  onQuestionMoveDown: (index: number) => void;
  onSave: () => void;
  className?: string;
};

export function ApplicationFormEditor({
  description,
  questions,
  loading,
  canSave,
  onDescriptionChange,
  onQuestionChange,
  onQuestionRequiredChange,
  onQuestionAdd,
  onQuestionDelete,
  onQuestionMoveUp,
  onQuestionMoveDown,
  onSave,
  className,
}: ApplicationFormEditorProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Introduction / Description */}
      <div className="space-y-1">
        <span className="text-body-emphasis">{t('settings.applicationForm.introductionLabel')}</span>
        <MarkdownEditor value={description} onChange={onDescriptionChange} />
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-body-emphasis">{t('settings.applicationForm.questionsLabel')}</span>
          <Button type="button" variant="outline" size="sm" onClick={onQuestionAdd} disabled={loading}>
            <Plus aria-hidden="true" className="size-3.5 mr-1.5" />
            {t('settings.applicationForm.addQuestion')}
          </Button>
        </div>

        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">{t('settings.applicationForm.noQuestions')}</p>
        )}

        {questions.map((q, index) => (
          <div key={q.sortOrder} className="flex items-center gap-2 rounded-lg border p-3 bg-muted/10">
            <span className="size-7 rounded-full bg-primary/10 text-primary text-card-title flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <Input
                value={q.question}
                onChange={e => onQuestionChange(index, e.target.value)}
                placeholder={t('settings.applicationForm.questionPlaceholder')}
                className={cn('h-8 text-sm', !q.question.trim() && 'border-destructive')}
                aria-invalid={!q.question.trim()}
                disabled={loading}
              />
              {!q.question.trim() && (
                <p className="text-xs text-destructive mt-1">{t('settings.applicationForm.questionRequired')}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Label
                htmlFor={`q-required-${index}`}
                className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap"
              >
                {t('settings.applicationForm.required')}
              </Label>
              <Checkbox
                id={`q-required-${index}`}
                checked={q.required}
                onCheckedChange={checked => onQuestionRequiredChange(index, !!checked)}
                disabled={loading}
              />
            </div>
            <div className="flex items-center shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => onQuestionMoveUp(index)}
                disabled={loading || index === 0}
                aria-label={t('settings.applicationForm.moveUp')}
              >
                <ArrowUp aria-hidden="true" className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => onQuestionMoveDown(index)}
                disabled={loading || index === questions.length - 1}
                aria-label={t('settings.applicationForm.moveDown')}
              >
                <ArrowDown aria-hidden="true" className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setPendingDeleteIndex(index)}
                disabled={loading}
                aria-label={t('settings.applicationForm.deleteQuestion')}
              >
                <Trash2 aria-hidden="true" className="size-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button type="button" onClick={onSave} disabled={!canSave}>
          {t('settings.applicationForm.save')}
        </Button>
      </div>

      {/* Delete question confirmation */}
      <ConfirmationDialog
        open={pendingDeleteIndex !== null}
        onOpenChange={open => {
          if (!open) setPendingDeleteIndex(null);
        }}
        variant="destructive"
        title={t('settings.applicationForm.deleteConfirm.title')}
        description={t('settings.applicationForm.deleteConfirm.description')}
        confirmLabel={t('settings.applicationForm.deleteConfirm.confirm')}
        cancelLabel={t('dirtyGuard.cancel')}
        onConfirm={() => {
          if (pendingDeleteIndex !== null) {
            onQuestionDelete(pendingDeleteIndex);
            setPendingDeleteIndex(null);
          }
        }}
        onCancel={() => setPendingDeleteIndex(null)}
      />
    </div>
  );
}

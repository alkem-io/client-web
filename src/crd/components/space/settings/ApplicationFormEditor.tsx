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
        <span className="text-sm font-medium">
          {t('settings.applicationForm.introductionLabel', { defaultValue: 'Introduction' })}
        </span>
        <MarkdownEditor value={description} onChange={onDescriptionChange} />
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {t('settings.applicationForm.questionsLabel', { defaultValue: 'Questions' })}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onQuestionAdd} disabled={loading}>
            <Plus aria-hidden="true" className="size-3.5 mr-1.5" />
            {t('settings.applicationForm.addQuestion', { defaultValue: 'Add question' })}
          </Button>
        </div>

        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t('settings.applicationForm.noQuestions', { defaultValue: 'No questions added yet.' })}
          </p>
        )}

        {questions.map((q, index) => (
          <div key={q.sortOrder} className="flex items-center gap-2 rounded-lg border p-3 bg-muted/10">
            <span className="size-7 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <Input
                value={q.question}
                onChange={e => onQuestionChange(index, e.target.value)}
                placeholder={t('settings.applicationForm.questionPlaceholder', { defaultValue: 'Enter question…' })}
                className={cn('h-8 text-sm', !q.question.trim() && 'border-destructive')}
                aria-invalid={!q.question.trim()}
                disabled={loading}
              />
              {!q.question.trim() && (
                <p className="text-xs text-destructive mt-1">
                  {t('settings.applicationForm.questionRequired', { defaultValue: 'Question text is required' })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Label
                htmlFor={`q-required-${index}`}
                className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap"
              >
                {t('settings.applicationForm.required', { defaultValue: 'Required' })}
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
                aria-label={t('settings.applicationForm.moveUp', { defaultValue: 'Move up' })}
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
                aria-label={t('settings.applicationForm.moveDown', { defaultValue: 'Move down' })}
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
                aria-label={t('settings.applicationForm.deleteQuestion', { defaultValue: 'Delete question' })}
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
          {t('settings.applicationForm.save', { defaultValue: 'Save' })}
        </Button>
      </div>

      {/* Delete question confirmation */}
      <ConfirmationDialog
        open={pendingDeleteIndex !== null}
        onOpenChange={open => {
          if (!open) setPendingDeleteIndex(null);
        }}
        variant="destructive"
        title={t('settings.applicationForm.deleteConfirm.title', { defaultValue: 'Delete question' })}
        description={t('settings.applicationForm.deleteConfirm.description', {
          defaultValue: 'Are you sure you want to remove this question?',
        })}
        confirmLabel={t('settings.applicationForm.deleteConfirm.confirm', { defaultValue: 'Delete' })}
        cancelLabel={t('dirtyGuard.cancel', { defaultValue: 'Cancel' })}
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

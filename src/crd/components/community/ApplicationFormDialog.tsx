import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/crd/primitives/dialog';

export type ApplicationQuestion = {
  question: string;
  required: boolean;
  maxLength: number;
  sortOrder?: number;
};

export type ApplicationAnswer = {
  name: string;
  value: string;
  sortOrder: number;
};

type GuidelinesData = {
  displayName?: string;
  description?: string;
  references?: Array<{ name: string; uri: string; description?: string }>;
};

type ApplicationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityName?: string;
  formDescription?: string;
  questions: ApplicationQuestion[];
  guidelines?: GuidelinesData;
  mode: 'apply' | 'join';
  submitting: boolean;
  onSubmit: (answers: ApplicationAnswer[]) => void;
  className?: string;
};

const buildSchema = (questions: ApplicationQuestion[], requiredMsg: string, maxLengthMsg: (n: number) => string) =>
  yup.object().shape(
    questions.reduce<Record<string, yup.StringSchema>>((acc, q) => {
      const base = yup.string().max(q.maxLength, maxLengthMsg(q.maxLength));
      acc[q.question] = q.required ? base.required(requiredMsg) : base;
      return acc;
    }, {})
  );

export function ApplicationFormDialog({
  open,
  onOpenChange,
  communityName,
  formDescription,
  questions,
  guidelines,
  mode,
  submitting,
  onSubmit,
  className,
}: ApplicationFormDialogProps) {
  const { t } = useTranslation('crd-space');

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Reset state when the dialog opens or the question set changes
  useEffect(() => {
    if (open) {
      setAnswers({});
      setTouched({});
      setSubmitAttempted(false);
    }
  }, [open, questions]);

  const schema = buildSchema(questions, t('apply.required'), n => t('apply.maxLength', { count: n }));

  const errors: Record<string, string> = {};
  for (const q of questions) {
    try {
      schema.validateSyncAt(q.question, answers);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        errors[q.question] = err.message;
      }
    }
  }

  const isValid = Object.keys(errors).length === 0;
  const isJoinMode = mode === 'join';

  const title = isJoinMode
    ? t('apply.joinTitle', { name: communityName ?? '' })
    : t('apply.applyTitle', { name: communityName ?? '' });

  const subheader = isJoinMode
    ? t('apply.subheaderJoin', { name: communityName ?? '' })
    : formDescription
      ? null
      : t('apply.subheader');

  const submitLabel = submitting ? t('apply.processing') : isJoinMode ? t('apply.join') : t('apply.apply');

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!isValid) return;
    const payload: ApplicationAnswer[] = questions.map(q => ({
      name: q.question,
      value: answers[q.question] ?? '',
      sortOrder: q.sortOrder ?? 0,
    }));
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'w-full sm:max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col bg-background',
          className
        )}
      >
        <div className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          {subheader && <DialogDescription className="mt-1 text-sm">{subheader}</DialogDescription>}
          {!subheader && (
            <DialogDescription className="sr-only">
              {t('apply.applyTitle', { name: communityName ?? '' })}
            </DialogDescription>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {!isJoinMode && formDescription && <MarkdownContent content={formDescription} />}

          {!isJoinMode &&
            questions.map(q => {
              const fieldId = `apply-q-${q.question.replace(/\s+/g, '-')}`;
              const showError = errors[q.question] && (submitAttempted || touched[q.question]);
              return (
                <div key={q.question} className="space-y-1.5">
                  <label htmlFor={fieldId} className="block text-sm font-medium text-foreground">
                    {q.question}
                    {q.required && (
                      <span aria-hidden="true" className="text-destructive ml-1">
                        *
                      </span>
                    )}
                  </label>
                  <textarea
                    id={fieldId}
                    rows={3}
                    maxLength={q.maxLength}
                    value={answers[q.question] ?? ''}
                    aria-required={q.required}
                    aria-invalid={!!showError}
                    aria-describedby={showError ? `${fieldId}-error` : undefined}
                    onChange={e => setAnswers(prev => ({ ...prev, [q.question]: e.target.value }))}
                    onBlur={() => setTouched(prev => ({ ...prev, [q.question]: true }))}
                    className={cn(
                      'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y',
                      showError && 'border-destructive focus-visible:ring-destructive'
                    )}
                  />
                  {showError && (
                    <p id={`${fieldId}-error`} role="alert" className="text-xs text-destructive">
                      {errors[q.question]}
                    </p>
                  )}
                </div>
              );
            })}

          {guidelines?.description && (
            <div className="border-t border-border pt-6 space-y-3">
              {guidelines.displayName && (
                <h3 className="text-sm font-semibold text-foreground">{guidelines.displayName}</h3>
              )}
              <MarkdownContent content={guidelines.description} />
              {guidelines.references && guidelines.references.length > 0 && (
                <ul className="space-y-1">
                  {guidelines.references.map(ref => (
                    <li key={ref.uri}>
                      <a
                        href={ref.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary underline-offset-4 hover:underline"
                      >
                        {ref.name}
                      </a>
                      {ref.description && <span className="ml-2 text-xs text-muted-foreground">{ref.description}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t('apply.cancel')}
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSubmit}
            disabled={submitting || !isValid}
            aria-busy={submitting}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

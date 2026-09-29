import { Lock } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormAnswerInput, FormQuestionView } from '@/crd/components/callout/calloutFormTypes';
import {
  FORM_LONG_ANSWER_MAX_LENGTH,
  FORM_SHORT_ANSWER_MAX_LENGTH,
  isChoiceKind,
} from '@/crd/forms/callout/formValues';
import type { FormResponseVisibilityValue, FormStateValue } from '@/crd/forms/callout/types';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Checkbox } from '@/crd/primitives/checkbox';
import { Input } from '@/crd/primitives/input';
import { RadioGroup, RadioGroupItem } from '@/crd/primitives/radio-group';
import { Textarea } from '@/crd/primitives/textarea';

type CalloutFormFillInProps = {
  questions: FormQuestionView[];
  /** Who can read every response; drives the privacy notice the respondent acknowledges. */
  visibility: FormResponseVisibilityValue;
  spaceName: string;
  state: FormStateValue;
  published: boolean;
  /** Contribute privilege ∧ published ∧ open. When false the questions are shown read-only. */
  canSubmit: boolean;
  submitting: boolean;
  /** Server-side per-question errors, keyed by question id. */
  errors?: Record<string, string | undefined>;
  onSubmit: (answers: FormAnswerInput[]) => void;
  className?: string;
};

type DraftAnswer = { text: string; selected: string[] };

const emptyDraft = (): DraftAnswer => ({ text: '', selected: [] });

const isAnswered = (question: FormQuestionView, draft: DraftAnswer | undefined): boolean => {
  if (!draft) return false;
  return isChoiceKind(question.type) ? draft.selected.length > 0 : draft.text.trim().length > 0;
};

function QuestionLabel({ id, question }: { id: string; question: FormQuestionView }) {
  const { t } = useTranslation('crd-space');
  return (
    <span id={id} className="text-body-emphasis text-foreground">
      {question.prompt}
      {question.required && (
        <>
          <span aria-hidden="true" className="ml-1 text-destructive">
            *
          </span>
          <span className="sr-only"> ({t('formFillIn.requiredMarker')})</span>
        </>
      )}
    </span>
  );
}

export function CalloutFormFillIn({
  questions,
  visibility,
  spaceName,
  state,
  published,
  canSubmit,
  submitting,
  errors,
  onSubmit,
  className,
}: CalloutFormFillInProps) {
  const { t } = useTranslation('crd-space');
  const [drafts, setDrafts] = useState<Record<string, DraftAnswer>>({});
  const [missing, setMissing] = useState<Record<string, boolean>>({});

  const readOnly = !canSubmit || submitting;
  const draftOf = (id: string) => drafts[id] ?? emptyDraft();
  const setDraft = (id: string, patch: Partial<DraftAnswer>) => {
    setDrafts(prev => ({ ...prev, [id]: { ...(prev[id] ?? emptyDraft()), ...patch } }));
    if (missing[id]) setMissing(prev => ({ ...prev, [id]: false }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    const nextMissing: Record<string, boolean> = {};
    for (const question of questions) {
      if (question.required && !isAnswered(question, drafts[question.id])) nextMissing[question.id] = true;
    }
    setMissing(nextMissing);
    if (Object.keys(nextMissing).length > 0) return;

    onSubmit(
      questions
        .filter(question => isAnswered(question, drafts[question.id]))
        .map(question => {
          const draft = draftOf(question.id);
          return isChoiceKind(question.type)
            ? { questionID: question.id, selectedOptionIDs: draft.selected }
            : { questionID: question.id, text: draft.text.trim() };
        })
    );
  };

  const statusBadge = !published
    ? t('formFillIn.draftBadge')
    : state === 'CLOSED'
      ? t('formFillIn.closedBadge')
      : undefined;
  const statusMessage = !published
    ? t('formFillIn.draftNotice')
    : state === 'CLOSED'
      ? t('formFillIn.closedNotice')
      : undefined;

  return (
    <form noValidate={true} onSubmit={handleSubmit} className={cn('space-y-5', className)}>
      {(statusBadge || (!canSubmit && !statusMessage)) && (
        <div className="flex flex-wrap items-center gap-2">
          {statusBadge && <Badge variant="secondary">{statusBadge}</Badge>}
          <span className="text-caption text-muted-foreground">{statusMessage ?? t('formFillIn.cannotRespond')}</span>
        </div>
      )}

      {questions.map(question => {
        const idBase = `form-fill-${question.id}`;
        const labelId = `${idBase}-label`;
        const helpId = `${idBase}-help`;
        const errorId = `${idBase}-error`;
        const draft = draftOf(question.id);
        const errorText = missing[question.id] ? t('formFillIn.requiredError') : errors?.[question.id];
        const describedBy =
          [question.explanation ? helpId : undefined, errorText ? errorId : undefined].filter(Boolean).join(' ') ||
          undefined;

        return (
          <div key={question.id} className="space-y-2">
            {question.type === 'SHORT_TEXT' || question.type === 'LONG_TEXT' ? (
              <label htmlFor={idBase} className="block">
                <QuestionLabel id={labelId} question={question} />
              </label>
            ) : (
              <QuestionLabel id={labelId} question={question} />
            )}
            {question.explanation && (
              <p id={helpId} className="text-caption text-muted-foreground">
                {question.explanation}
              </p>
            )}

            {question.type === 'SHORT_TEXT' && (
              <div className="space-y-1">
                <Input
                  id={idBase}
                  value={draft.text}
                  onChange={e => setDraft(question.id, { text: e.target.value })}
                  maxLength={FORM_SHORT_ANSWER_MAX_LENGTH}
                  readOnly={readOnly}
                  aria-required={question.required}
                  aria-invalid={errorText ? true : undefined}
                  aria-describedby={describedBy}
                />
                {!readOnly && (
                  <span className="block text-right text-caption tabular-nums text-muted-foreground">
                    {draft.text.length}/{FORM_SHORT_ANSWER_MAX_LENGTH}
                  </span>
                )}
              </div>
            )}

            {question.type === 'LONG_TEXT' && (
              <div className="space-y-1">
                <Textarea
                  id={idBase}
                  value={draft.text}
                  onChange={e => setDraft(question.id, { text: e.target.value })}
                  maxLength={FORM_LONG_ANSWER_MAX_LENGTH}
                  readOnly={readOnly}
                  rows={4}
                  aria-required={question.required}
                  aria-invalid={errorText ? true : undefined}
                  aria-describedby={describedBy}
                />
                {!readOnly && (
                  <span className="block text-right text-caption tabular-nums text-muted-foreground">
                    {draft.text.length}/{FORM_LONG_ANSWER_MAX_LENGTH}
                  </span>
                )}
              </div>
            )}

            {question.type === 'SINGLE_CHOICE' && (
              <RadioGroup
                value={draft.selected[0] ?? ''}
                onValueChange={value => setDraft(question.id, { selected: [value] })}
                disabled={readOnly}
                aria-labelledby={labelId}
                aria-required={question.required}
                aria-invalid={errorText ? true : undefined}
                aria-describedby={describedBy}
              >
                {question.options.map(option => (
                  <div key={option.id} className="flex items-center gap-2">
                    <RadioGroupItem id={`${idBase}-${option.id}`} value={option.id} />
                    <label htmlFor={`${idBase}-${option.id}`} className="text-body">
                      {option.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === 'MULTIPLE_CHOICE' && (
              <fieldset
                aria-labelledby={labelId}
                aria-describedby={describedBy}
                className="m-0 grid min-w-0 gap-3 border-0 p-0"
              >
                {question.options.map(option => {
                  const checked = draft.selected.includes(option.id);
                  return (
                    <div key={option.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`${idBase}-${option.id}`}
                        checked={checked}
                        disabled={readOnly}
                        onCheckedChange={next =>
                          setDraft(question.id, {
                            selected:
                              next === true
                                ? [...draft.selected, option.id]
                                : draft.selected.filter(id => id !== option.id),
                          })
                        }
                      />
                      <label htmlFor={`${idBase}-${option.id}`} className="text-body">
                        {option.label}
                      </label>
                    </div>
                  );
                })}
              </fieldset>
            )}

            {errorText && (
              <p id={errorId} className="text-caption text-destructive" role="alert">
                {errorText}
              </p>
            )}
          </div>
        );
      })}

      {canSubmit && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-caption text-muted-foreground">
            <Lock className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              {visibility === 'ADMINS'
                ? t('formFillIn.noticeAdmins', { space: spaceName })
                : t('formFillIn.noticeMembers', { space: spaceName })}
            </span>
          </p>
          <Button type="submit" disabled={submitting}>
            {submitting ? t('formFillIn.submitting') : t('formFillIn.submit')}
          </Button>
        </div>
      )}
    </form>
  );
}

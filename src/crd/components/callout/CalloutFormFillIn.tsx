import { type FormEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormAnswerInput, FormQuestionView } from '@/crd/components/callout/calloutFormTypes';
import {
  formBoxFooterClass,
  formOptionRowClass,
  formQuestionCardClass,
  formQuestionPromptClass,
} from '@/crd/components/callout/formStyles';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import {
  FORM_LONG_ANSWER_MAX_LENGTH,
  FORM_SHORT_ANSWER_MAX_LENGTH,
  isChoiceKind,
} from '@/crd/forms/callout/formValues';
import type { FormStateValue } from '@/crd/forms/callout/types';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Checkbox } from '@/crd/primitives/checkbox';
import { Input } from '@/crd/primitives/input';
import { RadioGroup, RadioGroupItem } from '@/crd/primitives/radio-group';
import { Textarea } from '@/crd/primitives/textarea';

/**
 * The questions of a Form, as boxed cards, with the Cancel / Submit footer when the viewer can respond.
 * Rendered inside `CalloutFormBox`, whose header carries the title, the visibility notice and the state badge.
 */
type CalloutFormFillInProps = {
  questions: FormQuestionView[];
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

/** The length counter only appears once an answer gets close to its limit. */
const COUNTER_THRESHOLD = 0.8;

const isAnswered = (question: FormQuestionView, draft: DraftAnswer | undefined): boolean => {
  if (!draft) return false;
  return isChoiceKind(question.type) ? draft.selected.length > 0 : draft.text.trim().length > 0;
};

const textFieldClass = 'rounded-[8px] bg-card px-3';

function QuestionLabel({ id, number, question }: { id: string; number: number; question: FormQuestionView }) {
  const { t } = useTranslation('crd-space');
  return (
    <span id={id} className={formQuestionPromptClass}>
      <span>{number}.</span>
      <span>
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
    </span>
  );
}

function LengthCounter({ length, max }: { length: number; max: number }) {
  if (length < max * COUNTER_THRESHOLD) return null;
  return (
    <span className="block text-right text-caption tabular-nums text-muted-foreground">
      {length}/{max}
    </span>
  );
}

export function CalloutFormFillIn({
  questions,
  state,
  published,
  canSubmit,
  submitting,
  errors,
  onSubmit,
  className,
}: CalloutFormFillInProps) {
  const { t } = useTranslation('crd-space');
  // Every mounted copy of the form (feed card and detail dialog) needs its own
  // element ids, otherwise label clicks and aria references hit the other copy.
  const instanceId = useId();
  const [drafts, setDrafts] = useState<Record<string, DraftAnswer>>({});
  const [missing, setMissing] = useState<Record<string, boolean>>({});
  const [resetOpen, setResetOpen] = useState(false);

  const readOnly = !canSubmit || submitting;
  const hasInput = questions.some(question => isAnswered(question, drafts[question.id]));
  const draftOf = (id: string) => drafts[id] ?? emptyDraft();
  const setDraft = (id: string, patch: Partial<DraftAnswer>) => {
    setDrafts(prev => ({ ...prev, [id]: { ...(prev[id] ?? emptyDraft()), ...patch } }));
    if (missing[id]) setMissing(prev => ({ ...prev, [id]: false }));
  };

  const handleReset = () => {
    setDrafts({});
    setMissing({});
    setResetOpen(false);
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

  const statusMessage = !published
    ? t('formFillIn.draftNotice')
    : state === 'CLOSED'
      ? t('formFillIn.closedNotice')
      : undefined;

  return (
    <>
      <form noValidate={true} onSubmit={handleSubmit} className={cn('space-y-5', className)}>
        {!canSubmit && (
          <p className="text-caption text-muted-foreground">{statusMessage ?? t('formFillIn.cannotRespond')}</p>
        )}

        {questions.map((question, index) => {
          const idBase = `form-fill-${instanceId}-${question.id}`;
          const labelId = `${idBase}-label`;
          const helpId = `${idBase}-help`;
          const errorId = `${idBase}-error`;
          const draft = draftOf(question.id);
          const errorText = missing[question.id] ? t('formFillIn.requiredError') : errors?.[question.id];
          const describedBy =
            [question.explanation ? helpId : undefined, errorText ? errorId : undefined].filter(Boolean).join(' ') ||
            undefined;

          return (
            <div key={question.id} className={formQuestionCardClass}>
              <div className="space-y-0.5">
                {question.type === 'SHORT_TEXT' || question.type === 'LONG_TEXT' ? (
                  <label htmlFor={idBase} className="block">
                    <QuestionLabel id={labelId} number={index + 1} question={question} />
                  </label>
                ) : (
                  <QuestionLabel id={labelId} number={index + 1} question={question} />
                )}
                {question.explanation && (
                  <p id={helpId} className="text-caption text-muted-foreground">
                    {question.explanation}
                  </p>
                )}
              </div>

              {question.type === 'SHORT_TEXT' && (
                <div className="space-y-1">
                  <Input
                    id={idBase}
                    value={draft.text}
                    onChange={e => setDraft(question.id, { text: e.target.value })}
                    maxLength={FORM_SHORT_ANSWER_MAX_LENGTH}
                    readOnly={readOnly}
                    placeholder={readOnly ? undefined : t('formFillIn.answerPlaceholder')}
                    className={cn('h-10', textFieldClass)}
                    aria-required={question.required}
                    aria-invalid={errorText ? true : undefined}
                    aria-describedby={describedBy}
                  />
                  {!readOnly && <LengthCounter length={draft.text.length} max={FORM_SHORT_ANSWER_MAX_LENGTH} />}
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
                    placeholder={readOnly ? undefined : t('formFillIn.answerPlaceholder')}
                    rows={3}
                    className={cn('min-h-24 py-2.5', textFieldClass)}
                    aria-required={question.required}
                    aria-invalid={errorText ? true : undefined}
                    aria-describedby={describedBy}
                  />
                  {!readOnly && <LengthCounter length={draft.text.length} max={FORM_LONG_ANSWER_MAX_LENGTH} />}
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
                  className="gap-2"
                >
                  {question.options.map(option => {
                    const selected = draft.selected[0] === option.id;
                    return (
                      <label
                        key={option.id}
                        htmlFor={`${idBase}-${option.id}`}
                        className={formOptionRowClass(selected, !readOnly)}
                      >
                        <RadioGroupItem
                          id={`${idBase}-${option.id}`}
                          value={option.id}
                          className="border-muted-foreground bg-card shadow-none disabled:opacity-100 data-[state=checked]:border-[5px] data-[state=checked]:border-primary [&_svg]:hidden"
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </RadioGroup>
              )}

              {question.type === 'MULTIPLE_CHOICE' && (
                <fieldset
                  aria-labelledby={labelId}
                  aria-describedby={describedBy}
                  className="m-0 grid min-w-0 gap-2 border-0 p-0"
                >
                  {question.options.map(option => {
                    const checked = draft.selected.includes(option.id);
                    return (
                      <label
                        key={option.id}
                        htmlFor={`${idBase}-${option.id}`}
                        className={formOptionRowClass(checked, !readOnly)}
                      >
                        <Checkbox
                          id={`${idBase}-${option.id}`}
                          checked={checked}
                          disabled={readOnly}
                          className="border-muted-foreground bg-card shadow-none disabled:opacity-100"
                          onCheckedChange={next =>
                            setDraft(question.id, {
                              selected:
                                next === true
                                  ? [...draft.selected, option.id]
                                  : draft.selected.filter(id => id !== option.id),
                            })
                          }
                        />
                        {option.label}
                      </label>
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
          <div className={formBoxFooterClass}>
            <Button
              type="button"
              variant="ghost"
              className="normal-case!"
              disabled={submitting || !hasInput}
              onClick={() => setResetOpen(true)}
            >
              {t('formFillIn.cancel')}
            </Button>
            <Button type="submit" className="normal-case!" disabled={submitting} aria-busy={submitting || undefined}>
              {submitting ? t('formFillIn.submitting') : t('formFillIn.submit')}
            </Button>
          </div>
        )}
      </form>

      <ConfirmationDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        variant="destructive"
        title={t('formFillIn.resetConfirm.title')}
        description={t('formFillIn.resetConfirm.description')}
        confirmLabel={t('formFillIn.resetConfirm.confirm')}
        onConfirm={handleReset}
      />
    </>
  );
}

import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ClipboardList, GripVertical, Plus, Trash2 } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import {
  createFormOption,
  createFormQuestion,
  FORM_DESCRIPTION_MAX_LENGTH,
  FORM_EXPLANATION_MAX_LENGTH,
  FORM_OPTION_MAX_LENGTH,
  FORM_OPTIONS_MAX,
  FORM_OPTIONS_MIN,
  FORM_PROMPT_MAX_LENGTH,
  FORM_QUESTION_KINDS,
  FORM_QUESTIONS_MAX,
  FORM_QUESTIONS_MIN,
  FORM_TITLE_MAX_LENGTH,
  isChoiceKind,
} from '@/crd/forms/callout/formValues';
import type { FormOptionValue, FormQuestionKind, FormQuestionValue } from '@/crd/forms/callout/types';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import { Switch } from '@/crd/primitives/switch';
import { Textarea } from '@/crd/primitives/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

type FormQuestionsEditorProps = {
  questions: FormQuestionValue[];
  onChange: (questions: FormQuestionValue[]) => void;
  /**
   * Validation messages: `title` and `description` for the header box, `questions` for the list-level rule,
   * then `<index>.prompt`,
   * `<index>.explanation`, `<index>.options` and `<index>.options.<optionIndex>` per question.
   */
  errors?: Record<string, string | undefined>;
  /** The Form's optional title and description, edited in a box above the first question. */
  title?: string;
  onTitleChange?: (title: string) => void;
  description?: string;
  onDescriptionChange?: (description: string) => void;
  /**
   * Existing question ids that may already have answers: changing one's answer type shows a hint that
   * existing answers keep their original format. The type stays changeable either way.
   */
  answeredHintQuestionIds?: string[];
  disabled?: boolean;
  /** Rendered beside the heading, e.g. the settings button. */
  settingsSlot?: ReactNode;
  className?: string;
};

type PendingDelete = { kind: 'question'; index: number } | { kind: 'option'; index: number; optionIndex: number };

const QUESTION_TYPE_KEY = {
  SHORT_TEXT: 'formForm.type.SHORT_TEXT',
  LONG_TEXT: 'formForm.type.LONG_TEXT',
  SINGLE_CHOICE: 'formForm.type.SINGLE_CHOICE',
  MULTIPLE_CHOICE: 'formForm.type.MULTIPLE_CHOICE',
} as const;

/**
 * Whether removing the question would discard typed input: a prompt, an explanation or the label of a
 * visible option. A text question keeps its options hidden in state, so they do not count.
 */
const questionHasContent = (question: FormQuestionValue) =>
  question.prompt.trim() !== '' ||
  question.explanation.trim() !== '' ||
  (isChoiceKind(question.type) && question.options.some(option => option.label.trim() !== ''));

/** One box of the builder: the Form header and each question share this look. */
const formBuilderBoxClass = 'space-y-3 rounded-lg border bg-card p-4';

function CharacterCounter({ length, max }: { length: number; max: number }) {
  return (
    <span className={cn('text-caption tabular-nums text-muted-foreground', length > max && 'text-destructive')}>
      {length}/{max}
    </span>
  );
}

function SortableOptionRow({
  option,
  index,
  questionNumber,
  canRemove,
  disabled,
  error,
  onLabelChange,
  onRemove,
}: {
  option: FormOptionValue;
  index: number;
  questionNumber: number;
  canRemove: boolean;
  disabled: boolean;
  error?: string;
  onLabelChange: (label: string) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation('crd-space');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: option.key,
    disabled,
  });
  const inputId = `form-q${questionNumber}-option-${option.key}`;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className={cn('space-y-1', isDragging && 'opacity-50 z-10')}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...listeners}
          {...attributes}
          disabled={disabled}
          className="shrink-0 text-muted-foreground hover:text-foreground cursor-grab disabled:cursor-default disabled:opacity-50 touch-none"
          aria-label={t('formForm.dragOption', { number: index + 1 })}
        >
          <GripVertical className="w-4 h-4" aria-hidden="true" />
        </button>
        <Input
          id={inputId}
          value={option.label}
          onChange={e => onLabelChange(e.target.value)}
          placeholder={t('formForm.optionLabel', { number: index + 1 })}
          aria-label={t('formForm.optionLabel', { number: index + 1 })}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          disabled={disabled}
          maxLength={FORM_OPTION_MAX_LENGTH}
          className="flex-1"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          disabled={disabled || !canRemove}
          aria-label={t('formForm.removeOption')}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-caption text-destructive pl-6">
          {error}
        </p>
      )}
    </div>
  );
}

function OptionsEditor({
  question,
  questionNumber,
  disabled,
  errors,
  errorPrefix,
  onChange,
  onRequestRemove,
}: {
  question: FormQuestionValue;
  questionNumber: number;
  disabled: boolean;
  errors: Record<string, string | undefined>;
  errorPrefix: string;
  onChange: (options: FormOptionValue[]) => void;
  onRequestRemove: (optionIndex: number) => void;
}) {
  const { t } = useTranslation('crd-space');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const itemIds = question.options.map(option => option.key);
  const listError = errors[`${errorPrefix}.options`];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = itemIds.indexOf(String(active.id));
    const to = itemIds.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onChange(arrayMove(question.options, from, to));
  };

  return (
    <div className="space-y-2">
      <span className="text-caption text-muted-foreground">{t('formForm.optionsHeading')}</span>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {question.options.map((option, index) => (
            <SortableOptionRow
              key={option.key}
              option={option}
              index={index}
              questionNumber={questionNumber}
              canRemove={question.options.length > FORM_OPTIONS_MIN}
              disabled={disabled}
              error={errors[`${errorPrefix}.options.${index}`]}
              onLabelChange={label => onChange(question.options.map((o, i) => (i === index ? { ...o, label } : o)))}
              onRemove={() => onRequestRemove(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
      {listError && (
        <p className="text-caption text-destructive" aria-live="polite">
          {listError}
        </p>
      )}
      {!disabled && question.options.length < FORM_OPTIONS_MAX && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => onChange([...question.options, createFormOption()])}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            {t('formForm.addOption')}
          </Button>
        </div>
      )}
    </div>
  );
}

function SortableQuestionRow({
  question,
  index,
  canRemove,
  disabled,
  typeChangeHint,
  errors,
  onChange,
  onRequestRemove,
  onRequestRemoveOption,
}: {
  question: FormQuestionValue;
  index: number;
  canRemove: boolean;
  disabled: boolean;
  /** Show the "existing answers keep their original format" hint once the answer type changes. */
  typeChangeHint: boolean;
  errors: Record<string, string | undefined>;
  onChange: (question: FormQuestionValue) => void;
  onRequestRemove: () => void;
  onRequestRemoveOption: (optionIndex: number) => void;
}) {
  const { t } = useTranslation('crd-space');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.key,
    disabled,
  });
  // Visual only: whether the answer type was changed during this edit, to show the hint.
  const [typeChanged, setTypeChanged] = useState(false);
  const number = index + 1;
  const idBase = `form-question-${question.key}`;
  const errorPrefix = String(index);
  const promptError = errors[`${errorPrefix}.prompt`];
  const explanationError = errors[`${errorPrefix}.explanation`];

  const handleTypeChange = (next: FormQuestionKind) => {
    if (next === question.type) return;
    setTypeChanged(true);
    // A text type keeps the options in state (hidden; the mapper drops them on save), so switching back to a
    // choice type restores the typed labels and their option ids instead of discarding them unconfirmed.
    if (!isChoiceKind(next)) {
      onChange({ ...question, type: next });
      return;
    }
    const missing = Math.max(0, FORM_OPTIONS_MIN - question.options.length);
    const options = [...question.options, ...Array.from({ length: missing }, () => createFormOption())];
    onChange({ ...question, type: next, options });
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className={cn(
        'grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 rounded-lg border bg-card p-4',
        isDragging && 'opacity-50 z-10'
      )}
    >
      {/* Left column: the drag handle with the delete button beneath it. The top padding lines the
          handle up with the prompt input, below the prompt's label line. */}
      <div className="flex flex-col items-center gap-1 pt-5">
        <button
          type="button"
          {...listeners}
          {...attributes}
          disabled={disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground cursor-grab disabled:cursor-default disabled:opacity-50 touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-label={t('formForm.dragQuestion', { number })}
        >
          <GripVertical className="w-4 h-4" aria-hidden="true" />
        </button>
        <Tooltip>
          <TooltipTrigger asChild={true}>
            {/* The wrapper keeps the tooltip working while the button is disabled (last question). */}
            <span className="inline-flex">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={onRequestRemove}
                disabled={disabled || !canRemove}
                aria-label={t('formForm.removeQuestion')}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('formForm.removeQuestion')}</TooltipContent>
        </Tooltip>
      </div>

      {/* Right column: prompt, answer type and required on the first line (wraps on narrow screens),
          then the explanation, then the options of a choice question. */}
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
          <div className="min-w-[min(12rem,100%)] flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={`${idBase}-prompt`} className="text-caption text-muted-foreground">
                {t('formForm.questionNumber', { number })}
              </label>
              <CharacterCounter length={question.prompt.length} max={FORM_PROMPT_MAX_LENGTH} />
            </div>
            <Input
              id={`${idBase}-prompt`}
              value={question.prompt}
              onChange={e => onChange({ ...question, prompt: e.target.value })}
              placeholder={t('formForm.promptPlaceholder')}
              aria-invalid={promptError ? true : undefined}
              aria-describedby={promptError ? `${idBase}-prompt-error` : undefined}
              disabled={disabled}
            />
          </div>

          <Select
            value={question.type}
            onValueChange={value => handleTypeChange(value as FormQuestionKind)}
            disabled={disabled}
          >
            <SelectTrigger
              id={`${idBase}-type`}
              aria-label={t('formForm.typeLabel')}
              aria-describedby={typeChangeHint && typeChanged ? `${idBase}-type-hint` : undefined}
              className="w-full normal-case! sm:w-44"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORM_QUESTION_KINDS.map(kind => (
                <SelectItem key={kind} value={kind} className="normal-case!">
                  {t(QUESTION_TYPE_KEY[kind])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex h-9 items-center gap-2">
            <Switch
              id={`${idBase}-required`}
              checked={question.required}
              onCheckedChange={required => onChange({ ...question, required })}
              disabled={disabled}
            />
            <label htmlFor={`${idBase}-required`} className="text-caption text-muted-foreground">
              {t('formForm.required')}
            </label>
          </div>
        </div>

        {promptError && (
          <p id={`${idBase}-prompt-error`} className="text-caption text-destructive">
            {promptError}
          </p>
        )}
        {typeChangeHint && (
          <div aria-live="polite">
            {typeChanged && (
              <p id={`${idBase}-type-hint`} className="text-caption text-muted-foreground">
                {t('formForm.typeChangeHint')}
              </p>
            )}
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={`${idBase}-explanation`} className="text-caption text-muted-foreground">
              {t('formForm.explanationLabel')}
            </label>
            <CharacterCounter length={question.explanation.length} max={FORM_EXPLANATION_MAX_LENGTH} />
          </div>
          <Textarea
            id={`${idBase}-explanation`}
            value={question.explanation}
            onChange={e => onChange({ ...question, explanation: e.target.value })}
            placeholder={t('formForm.explanationPlaceholder')}
            aria-invalid={explanationError ? true : undefined}
            aria-describedby={explanationError ? `${idBase}-explanation-error` : undefined}
            disabled={disabled}
            rows={1}
            className="min-h-9"
          />
          {explanationError && (
            <p id={`${idBase}-explanation-error`} className="text-caption text-destructive">
              {explanationError}
            </p>
          )}
        </div>

        {isChoiceKind(question.type) && (
          <OptionsEditor
            question={question}
            questionNumber={number}
            disabled={disabled}
            errors={errors}
            errorPrefix={errorPrefix}
            onChange={options => onChange({ ...question, options })}
            onRequestRemove={onRequestRemoveOption}
          />
        )}
      </div>
    </div>
  );
}

/** The Form's optional title and description, in a box styled like the question boxes. */
function FormHeaderEditor({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  disabled,
  errors,
}: {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  disabled: boolean;
  errors: Record<string, string | undefined>;
}) {
  const { t } = useTranslation('crd-space');
  const titleError = errors.title;
  const descriptionError = errors.description;

  return (
    <div className={formBuilderBoxClass} data-testid="form-header-editor">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="form-builder-title" className="text-caption text-muted-foreground">
            {t('formForm.title')}
          </label>
          <CharacterCounter length={title.length} max={FORM_TITLE_MAX_LENGTH} />
        </div>
        <Input
          id="form-builder-title"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder={t('formForm.titlePlaceholder')}
          aria-invalid={titleError ? true : undefined}
          aria-describedby={titleError ? 'form-builder-title-error' : undefined}
          disabled={disabled}
        />
        {titleError && (
          <p id="form-builder-title-error" className="text-caption text-destructive">
            {titleError}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="form-builder-description" className="text-caption text-muted-foreground">
            {t('formForm.description')}
          </label>
          <CharacterCounter length={description.length} max={FORM_DESCRIPTION_MAX_LENGTH} />
        </div>
        <Textarea
          id="form-builder-description"
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          placeholder={t('formForm.descriptionPlaceholder')}
          aria-invalid={descriptionError ? true : undefined}
          aria-describedby={descriptionError ? 'form-builder-description-error' : undefined}
          disabled={disabled}
          rows={2}
          className="min-h-16"
        />
        {descriptionError && (
          <p id="form-builder-description-error" className="text-caption text-destructive">
            {descriptionError}
          </p>
        )}
      </div>
    </div>
  );
}

export function FormQuestionsEditor({
  questions,
  onChange,
  title = '',
  onTitleChange,
  description = '',
  onDescriptionChange,
  errors = {},
  answeredHintQuestionIds = [],
  disabled = false,
  settingsSlot,
  className,
}: FormQuestionsEditorProps) {
  const { t } = useTranslation('crd-space');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  // Golden Rule 9: a deletion that would discard typed input is confirmed; the trash icons only stage the
  // target here. An option is always confirmed; a question only when it has content (R21).
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const itemIds = questions.map(question => question.key);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = itemIds.indexOf(String(active.id));
    const to = itemIds.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onChange(arrayMove(questions, from, to));
  };

  const removeQuestion = (index: number) => onChange(questions.filter((_, i) => i !== index));

  const requestRemoveQuestion = (index: number) => {
    const question = questions[index];
    if (question && questionHasContent(question)) {
      setPendingDelete({ kind: 'question', index });
    } else {
      removeQuestion(index);
    }
  };

  const updateQuestion = (index: number, next: FormQuestionValue) =>
    onChange(questions.map((question, i) => (i === index ? next : question)));

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'question') {
      removeQuestion(pendingDelete.index);
    } else {
      const target = questions[pendingDelete.index];
      if (target) {
        updateQuestion(pendingDelete.index, {
          ...target,
          options: target.options.filter((_, i) => i !== pendingDelete.optionIndex),
        });
      }
    }
    setPendingDelete(null);
  };

  const pendingQuestion = pendingDelete?.kind === 'question' ? questions[pendingDelete.index] : undefined;
  const pendingOptionLabel =
    pendingDelete?.kind === 'option'
      ? questions[pendingDelete.index]?.options[pendingDelete.optionIndex]?.label.trim()
      : undefined;
  const pendingQuestionText = pendingQuestion?.prompt.trim();
  const listError = errors.questions;

  return (
    <div className={cn('space-y-3 p-4 border rounded-xl bg-muted/30', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <ClipboardList className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="text-card-title">{t('formForm.questionsHeading')}</span>
            <span className="text-body text-muted-foreground">{t('formForm.questionsDescription')}</span>
          </div>
        </div>
        {settingsSlot}
      </div>

      <FormHeaderEditor
        title={title}
        description={description}
        onTitleChange={next => onTitleChange?.(next)}
        onDescriptionChange={next => onDescriptionChange?.(next)}
        disabled={disabled}
        errors={errors}
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {questions.map((question, index) => (
              <SortableQuestionRow
                key={question.key}
                question={question}
                index={index}
                canRemove={questions.length > FORM_QUESTIONS_MIN}
                disabled={disabled}
                typeChangeHint={Boolean(question.id && answeredHintQuestionIds.includes(question.id))}
                errors={errors}
                onChange={next => updateQuestion(index, next)}
                onRequestRemove={() => requestRemoveQuestion(index)}
                onRequestRemoveOption={optionIndex => setPendingDelete({ kind: 'option', index, optionIndex })}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {listError && (
        <p className="text-caption text-destructive" aria-live="polite">
          {listError}
        </p>
      )}

      {!disabled && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => onChange([...questions, createFormQuestion()])}
          disabled={questions.length >= FORM_QUESTIONS_MAX}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t('formForm.addQuestion')}
        </Button>
      )}

      <ConfirmationDialog
        open={pendingDelete?.kind === 'question'}
        onOpenChange={open => {
          if (!open) setPendingDelete(null);
        }}
        title={t('formForm.removeQuestionConfirm.title')}
        description={
          pendingQuestionText
            ? t('formForm.removeQuestionConfirm.descriptionWithText', { text: pendingQuestionText })
            : t('formForm.removeQuestionConfirm.description')
        }
        confirmLabel={t('formForm.removeQuestion')}
        variant="destructive"
        onConfirm={confirmDelete}
      />
      <ConfirmationDialog
        open={pendingDelete?.kind === 'option'}
        onOpenChange={open => {
          if (!open) setPendingDelete(null);
        }}
        title={t('formForm.removeOptionConfirm.title')}
        description={
          pendingOptionLabel
            ? t('formForm.removeOptionConfirm.descriptionWithText', { text: pendingOptionLabel })
            : t('formForm.removeOptionConfirm.description')
        }
        confirmLabel={t('formForm.removeOption')}
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

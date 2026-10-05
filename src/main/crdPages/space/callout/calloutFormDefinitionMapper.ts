import { isEqual } from 'lodash-es';
import {
  CalloutFormQuestionType,
  CalloutFormResponseMode,
  CalloutFormResponseVisibility,
  CalloutFormState,
  type CreateCalloutFormInput,
  type UpdateCalloutFormInput,
} from '@/core/apollo/generated/graphql-schema';
import { createFormOption, createFormQuestion, isChoiceKind } from '@/crd/forms/callout/formValues';
import type {
  FormQuestionKind,
  FormQuestionValue,
  FormResponseModeValue,
  FormResponseVisibilityValue,
  FormSettingsValue,
  FormStateValue,
} from '@/crd/forms/callout/types';
import type { CalloutFormDetailsModel } from '@/domain/collaboration/callout-form/models/CalloutFormModels';

/**
 * Pure mappers between the Form builder values and the server Form types. No Apollo, no side effects.
 * The Form definition only ever travels through `createCallout` (create) and `updateCalloutForm` (edit) —
 * never through `updateCallout`.
 */

const QUESTION_KIND_TO_SERVER: Record<FormQuestionKind, CalloutFormQuestionType> = {
  SHORT_TEXT: CalloutFormQuestionType.ShortText,
  LONG_TEXT: CalloutFormQuestionType.LongText,
  SINGLE_CHOICE: CalloutFormQuestionType.SingleChoice,
  MULTIPLE_CHOICE: CalloutFormQuestionType.MultipleChoice,
};

const QUESTION_KIND_FROM_SERVER: Record<CalloutFormQuestionType, FormQuestionKind> = {
  [CalloutFormQuestionType.ShortText]: 'SHORT_TEXT',
  [CalloutFormQuestionType.LongText]: 'LONG_TEXT',
  [CalloutFormQuestionType.SingleChoice]: 'SINGLE_CHOICE',
  [CalloutFormQuestionType.MultipleChoice]: 'MULTIPLE_CHOICE',
};

const VISIBILITY_TO_SERVER: Record<FormResponseVisibilityValue, CalloutFormResponseVisibility> = {
  ADMINS: CalloutFormResponseVisibility.Admins,
  MEMBERS: CalloutFormResponseVisibility.Members,
};

const RESPONSE_MODE_TO_SERVER: Record<FormResponseModeValue, CalloutFormResponseMode> = {
  SINGLE: CalloutFormResponseMode.Single,
  MULTIPLE: CalloutFormResponseMode.Multiple,
};

const STATE_TO_SERVER: Record<FormStateValue, CalloutFormState> = {
  OPEN: CalloutFormState.Open,
  CLOSED: CalloutFormState.Closed,
};

const settingsToServer = (settings: FormSettingsValue) => ({
  visibility: VISIBILITY_TO_SERVER[settings.visibility],
  responseMode: RESPONSE_MODE_TO_SERVER[settings.responseMode],
  state: STATE_TO_SERVER[settings.state],
  defaultCollapsed: settings.defaultCollapsed,
});

/** Everything an admin edits on a Form: its optional title and description, the questions and the settings. */
export type FormDefinitionValue = {
  title: string;
  description: string;
  questions: FormQuestionValue[];
  settings: FormSettingsValue;
};

const trimmedExplanation = (question: FormQuestionValue) => question.explanation.trim() || undefined;

export const mapFormValuesToCreateInput = ({
  title,
  description,
  questions,
  settings,
}: FormDefinitionValue): CreateCalloutFormInput => ({
  // Both are optional: an empty value is simply left out.
  title: title.trim() || undefined,
  description: description.trim() || undefined,
  questions: questions.map(question => ({
    prompt: question.prompt.trim(),
    explanation: trimmedExplanation(question),
    type: QUESTION_KIND_TO_SERVER[question.type],
    required: question.required,
    // Text kinds carry no options even if the author switched the kind after adding some.
    options: isChoiceKind(question.type) ? question.options.map(option => ({ label: option.label.trim() })) : undefined,
  })),
  settings: settingsToServer(settings),
});

const questionsToUpdateInput = (questions: FormQuestionValue[]) =>
  questions.map(question => ({
    id: question.id,
    prompt: question.prompt.trim(),
    explanation: trimmedExplanation(question),
    type: QUESTION_KIND_TO_SERVER[question.type],
    required: question.required,
    options: isChoiceKind(question.type)
      ? question.options.map(option => ({ id: option.id, label: option.label.trim() }))
      : undefined,
  }));

/**
 * Title, description, settings plus, when the definition changed, the complete ordered question list for
 * `updateCalloutForm`. The title and description are always sent: an empty value clears them. The server
 * treats `questions` as a full replacement and an omitted list as "unchanged", so when the mapped questions
 * equal the ones the editor was opened with they are left out — a settings-only save must not overwrite
 * questions another admin changed in the meantime.
 */
export const mapFormValuesToUpdateInput = (
  formID: string,
  { title, description, questions, settings }: FormDefinitionValue,
  initialQuestions?: FormQuestionValue[]
): UpdateCalloutFormInput => {
  const mapped = questionsToUpdateInput(questions);
  const unchanged = initialQuestions !== undefined && isEqual(mapped, questionsToUpdateInput(initialQuestions));
  return {
    formID,
    title: title.trim(),
    description: description.trim(),
    ...(unchanged ? {} : { questions: mapped }),
    settings: settingsToServer(settings),
  };
};

export const formSettingsFromServer = (settings: CalloutFormDetailsModel['settings']): FormSettingsValue => ({
  visibility: settings.visibility === CalloutFormResponseVisibility.Members ? 'MEMBERS' : 'ADMINS',
  responseMode: settings.responseMode === CalloutFormResponseMode.Multiple ? 'MULTIPLE' : 'SINGLE',
  state: settings.state === CalloutFormState.Closed ? 'CLOSED' : 'OPEN',
  defaultCollapsed: settings.defaultCollapsed,
});

/** The optional title and description as builder values; a missing value is an empty string. */
export const formHeaderFromServer = (form: Pick<CalloutFormDetailsModel, 'title' | 'description'>) => ({
  formTitle: form.title ?? '',
  formDescription: form.description ?? '',
});

export const formQuestionsFromServer = (form: CalloutFormDetailsModel): FormQuestionValue[] =>
  form.questions.map(question =>
    createFormQuestion({
      id: question.id,
      prompt: question.prompt,
      explanation: question.explanation ?? '',
      type: QUESTION_KIND_FROM_SERVER[question.type],
      required: question.required,
      options: (question.options ?? []).map(option => createFormOption(option.label, option.id)),
    })
  );

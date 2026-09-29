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
});

const trimmedExplanation = (question: FormQuestionValue) => question.explanation.trim() || undefined;

export const mapFormValuesToCreateInput = (
  questions: FormQuestionValue[],
  settings: FormSettingsValue
): CreateCalloutFormInput => ({
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

/** The complete ordered question list plus settings, for `updateCalloutForm`. */
export const mapFormValuesToUpdateInput = (
  formID: string,
  questions: FormQuestionValue[],
  settings: FormSettingsValue
): UpdateCalloutFormInput => ({
  formID,
  questions: questions.map(question => ({
    id: question.id,
    prompt: question.prompt.trim(),
    explanation: trimmedExplanation(question),
    type: QUESTION_KIND_TO_SERVER[question.type],
    required: question.required,
    options: isChoiceKind(question.type)
      ? question.options.map(option => ({ id: option.id, label: option.label.trim() }))
      : undefined,
  })),
  settings: settingsToServer(settings),
});

export const formSettingsFromServer = (settings: CalloutFormDetailsModel['settings']): FormSettingsValue => ({
  visibility: settings.visibility === CalloutFormResponseVisibility.Members ? 'MEMBERS' : 'ADMINS',
  responseMode: settings.responseMode === CalloutFormResponseMode.Multiple ? 'MULTIPLE' : 'SINGLE',
  state: settings.state === CalloutFormState.Closed ? 'CLOSED' : 'OPEN',
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

import type {
  FormOptionValue,
  FormQuestionKind,
  FormQuestionValue,
  FormSettingsValue,
} from '@/crd/forms/callout/types';

/** Bounds enforced by the server; the builder mirrors them so authors see the limit before saving. */
export const FORM_QUESTIONS_MIN = 1;
export const FORM_QUESTIONS_MAX = 50;
export const FORM_OPTIONS_MIN = 2;
export const FORM_OPTIONS_MAX = 20;
export const FORM_PROMPT_MAX_LENGTH = 512;
export const FORM_EXPLANATION_MAX_LENGTH = 2048;
export const FORM_OPTION_MAX_LENGTH = 512;
export const FORM_SHORT_ANSWER_MAX_LENGTH = 512;
export const FORM_LONG_ANSWER_MAX_LENGTH = 2048;
export const FORM_TITLE_MAX_LENGTH = 512;
export const FORM_DESCRIPTION_MAX_LENGTH = 2048;

export const FORM_QUESTION_KINDS: FormQuestionKind[] = ['SHORT_TEXT', 'LONG_TEXT', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE'];

export const isChoiceKind = (kind: FormQuestionKind): boolean => kind === 'SINGLE_CHOICE' || kind === 'MULTIPLE_CHOICE';

let keyCounter = 0;
const nextKey = (prefix: string) => {
  keyCounter += 1;
  return `${prefix}-${keyCounter}`;
};

export const createFormOption = (label = '', id?: string): FormOptionValue => ({
  id,
  key: id ?? nextKey('option'),
  label,
});

export const createFormQuestion = (overrides: Partial<FormQuestionValue> = {}): FormQuestionValue => ({
  key: overrides.id ?? nextKey('question'),
  prompt: '',
  explanation: '',
  type: 'SHORT_TEXT',
  required: false,
  options: [],
  ...overrides,
});

export const DEFAULT_FORM_SETTINGS: FormSettingsValue = {
  visibility: 'ADMINS',
  responseMode: 'SINGLE',
  state: 'OPEN',
  defaultCollapsed: false,
};

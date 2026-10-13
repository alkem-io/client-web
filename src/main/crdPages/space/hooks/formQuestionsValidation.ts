import {
  FORM_EXPLANATION_MAX_LENGTH,
  FORM_OPTION_MAX_LENGTH,
  FORM_OPTIONS_MAX,
  FORM_OPTIONS_MIN,
  FORM_PROMPT_MAX_LENGTH,
  FORM_QUESTIONS_MAX,
  FORM_QUESTIONS_MIN,
  isChoiceKind,
} from '@/crd/forms/callout/formValues';
import type { FormQuestionValue } from '@/crd/forms/callout/types';

export type FormValidationCode =
  | 'questionsMin'
  | 'questionsMax'
  | 'promptRequired'
  | 'promptMax'
  | 'explanationMax'
  | 'optionsMin'
  | 'optionsMax'
  | 'optionRequired'
  | 'optionMax'
  | 'optionsDuplicate';

/** Error key of the list-level rule (question count). */
export const FORM_QUESTIONS_ERROR_KEY = 'formQuestions';

/** Prefix under which per-question errors live in `CalloutFormErrors`. */
export const FORM_QUESTION_ERROR_PREFIX = `${FORM_QUESTIONS_ERROR_KEY}.`;

/**
 * Pure validation of the Form builder values. Returns one code per failing field, keyed
 * `formQuestions` (count) and `formQuestions.<index>.prompt|explanation|options|options.<optionIndex>`.
 * Text kinds carry no options: the mapper drops them, so they are never validated here.
 */
export const validateFormQuestions = (questions: FormQuestionValue[]): Record<string, FormValidationCode> => {
  const errors: Record<string, FormValidationCode> = {};

  if (questions.length < FORM_QUESTIONS_MIN) {
    errors[FORM_QUESTIONS_ERROR_KEY] = 'questionsMin';
  } else if (questions.length > FORM_QUESTIONS_MAX) {
    errors[FORM_QUESTIONS_ERROR_KEY] = 'questionsMax';
  }

  questions.forEach((question, index) => {
    const base = `${FORM_QUESTION_ERROR_PREFIX}${index}`;
    const prompt = question.prompt.trim();
    if (!prompt) {
      errors[`${base}.prompt`] = 'promptRequired';
    } else if (prompt.length > FORM_PROMPT_MAX_LENGTH) {
      errors[`${base}.prompt`] = 'promptMax';
    }
    if (question.explanation.trim().length > FORM_EXPLANATION_MAX_LENGTH) {
      errors[`${base}.explanation`] = 'explanationMax';
    }
    if (!isChoiceKind(question.type)) return;

    const count = question.options.length;
    if (count < FORM_OPTIONS_MIN) {
      errors[`${base}.options`] = 'optionsMin';
    } else if (count > FORM_OPTIONS_MAX) {
      errors[`${base}.options`] = 'optionsMax';
    }

    const seen = new Set<string>();
    let hasDuplicate = false;
    question.options.forEach((option, optionIndex) => {
      const label = option.label.trim();
      if (!label) {
        errors[`${base}.options.${optionIndex}`] = 'optionRequired';
        return;
      }
      if (label.length > FORM_OPTION_MAX_LENGTH) {
        errors[`${base}.options.${optionIndex}`] = 'optionMax';
      }
      if (seen.has(label)) hasDuplicate = true;
      seen.add(label);
    });
    if (hasDuplicate && !errors[`${base}.options`]) {
      errors[`${base}.options`] = 'optionsDuplicate';
    }
  });

  return errors;
};

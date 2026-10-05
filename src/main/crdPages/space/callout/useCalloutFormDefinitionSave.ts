import type { TFunction } from 'i18next';
import { useUpdateCalloutFormMutation } from '@/core/apollo/generated/apollo-hooks';
import type { FormQuestionValue, FormSettingsValue } from '@/crd/forms/callout/types';
import type { CalloutFormDetailsModel } from '@/domain/collaboration/callout-form/models/CalloutFormModels';
import {
  CalloutFormErrorCode,
  type CalloutFormErrorCodeValue,
  getCalloutFormErrorCode,
} from '@/domain/collaboration/callout-form/utils/calloutFormErrors';
import { mapFormValuesToUpdateInput } from './calloutFormDefinitionMapper';

type CrdSpaceTranslator = TFunction<'crd-space'>;

/** Localized text for a rejected definition save; an unknown or missing code gets the generic message. */
export const translateFormDefinitionError = (code: CalloutFormErrorCodeValue | undefined, t: CrdSpaceTranslator) => {
  switch (code) {
    case CalloutFormErrorCode.FORM_VISIBILITY_WIDENING_BLOCKED:
      return t('formForm.errors.FORM_VISIBILITY_WIDENING_BLOCKED');
    case CalloutFormErrorCode.FORM_RESPONSE_MODE_SWITCH_BLOCKED:
      return t('formForm.errors.FORM_RESPONSE_MODE_SWITCH_BLOCKED');
    case CalloutFormErrorCode.FORM_QUESTION_TYPE_LOCKED:
      return t('formForm.errors.FORM_QUESTION_TYPE_LOCKED');
    case CalloutFormErrorCode.FORM_UNKNOWN_QUESTION_ID:
      return t('formForm.errors.FORM_UNKNOWN_QUESTION_ID');
    case CalloutFormErrorCode.FORM_UNKNOWN_OPTION_ID:
      return t('formForm.errors.FORM_UNKNOWN_OPTION_ID');
    case CalloutFormErrorCode.FORM_QUESTIONS_COUNT:
      return t('formForm.errors.FORM_QUESTIONS_COUNT');
    case CalloutFormErrorCode.FORM_OPTIONS_COUNT:
      return t('formForm.errors.FORM_OPTIONS_COUNT');
    case CalloutFormErrorCode.FORM_OPTIONS_DUPLICATE:
      return t('formForm.errors.FORM_OPTIONS_DUPLICATE');
    default:
      return t('formForm.errors.saveFailed');
  }
};

export type FormDefinitionSaveResult =
  | { ok: true; form: CalloutFormDetailsModel | undefined }
  | { ok: false; code: CalloutFormErrorCodeValue | undefined; error: unknown };

/**
 * Saves a Form's definition and settings through `updateCalloutForm` — the only path the definition takes
 * after creation. The Post-level save never carries it. Failures are returned, not thrown, so the caller
 * can keep its dialog open and show the localized reason.
 */
export const useCalloutFormDefinitionSave = () => {
  const [updateCalloutForm] = useUpdateCalloutFormMutation();

  const save = async (
    formId: string,
    questions: FormQuestionValue[],
    settings: FormSettingsValue,
    initialQuestions?: FormQuestionValue[]
  ): Promise<FormDefinitionSaveResult> => {
    try {
      const result = await updateCalloutForm({
        variables: { formData: mapFormValuesToUpdateInput(formId, questions, settings, initialQuestions) },
        context: { skipGlobalErrorHandler: true },
      });
      return { ok: true, form: result.data?.updateCalloutForm };
    } catch (error) {
      return { ok: false, code: getCalloutFormErrorCode(error), error };
    }
  };

  return { save };
};

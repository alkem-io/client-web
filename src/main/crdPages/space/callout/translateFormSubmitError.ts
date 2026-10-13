import type { TFunction } from 'i18next';
import {
  CalloutFormErrorCode,
  type CalloutFormErrorCodeValue,
} from '@/domain/collaboration/callout-form/utils/calloutFormErrors';

type CrdSpaceTranslator = TFunction<'crd-space'>;

/** Localized text for a rejected response submission. An unknown or missing code gets the generic message. */
export const translateFormSubmitError = (code: CalloutFormErrorCodeValue | undefined, t: CrdSpaceTranslator) => {
  switch (code) {
    case CalloutFormErrorCode.FORM_VISIBILITY_CHANGED:
      return t('formFillIn.visibilityChanged');
    case CalloutFormErrorCode.FORM_RESPONSE_ALREADY_EXISTS:
      return t('formFillIn.errors.FORM_RESPONSE_ALREADY_EXISTS');
    case CalloutFormErrorCode.FORM_CLOSED:
      return t('formFillIn.errors.FORM_CLOSED');
    case CalloutFormErrorCode.CALLOUT_NOT_PUBLISHED:
      return t('formFillIn.errors.CALLOUT_NOT_PUBLISHED');
    case CalloutFormErrorCode.FORM_ANSWER_REQUIRED:
      return t('formFillIn.errors.FORM_ANSWER_REQUIRED');
    case CalloutFormErrorCode.FORM_ANSWER_TOO_LONG:
      return t('formFillIn.errors.FORM_ANSWER_TOO_LONG');
    case CalloutFormErrorCode.FORM_ANSWER_UNKNOWN_QUESTION:
      return t('formFillIn.errors.FORM_ANSWER_UNKNOWN_QUESTION');
    case CalloutFormErrorCode.FORM_ANSWER_DUPLICATE_QUESTION:
      return t('formFillIn.errors.FORM_ANSWER_DUPLICATE_QUESTION');
    case CalloutFormErrorCode.FORM_ANSWER_TYPE_MISMATCH:
      return t('formFillIn.errors.FORM_ANSWER_TYPE_MISMATCH');
    case CalloutFormErrorCode.FORM_ANSWER_INVALID_OPTION:
      return t('formFillIn.errors.FORM_ANSWER_INVALID_OPTION');
    case CalloutFormErrorCode.FORM_ANSWER_SELECTION_COUNT:
      return t('formFillIn.errors.FORM_ANSWER_SELECTION_COUNT');
    default:
      return t('formFillIn.errors.generic');
  }
};

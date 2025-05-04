import * as yup from 'yup';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';

export const nameIdValidator = yup
  .string()
  .required('forms.validations.required')
  .min(3, params => TranslatedValidatedMessageWithPayload('forms.validations.minLength')({ min: params.min }))
  .max(25, params => TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max: params.max }))
  .matches(/^[a-z0-9-]*$/, 'forms.validations.alphaNumeric');

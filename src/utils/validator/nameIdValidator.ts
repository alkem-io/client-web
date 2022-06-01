import * as yup from 'yup';
import { createValidationMessageWithPayload } from '../../domain/shared/i18n/ValidationMessageTranslation';

export const nameIdValidator = yup
  .string()
  .required('forms.validations.required')
  .min(3, params => createValidationMessageWithPayload('forms.validations.minLength', params))
  .max(25, params => createValidationMessageWithPayload('forms.validations.maxLength', params))
  .matches(/^[a-z0-9-]*$/, 'forms.validations.alphaNumeric');

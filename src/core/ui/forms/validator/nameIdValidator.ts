import * as yup from 'yup';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';

export const nameIdValidator = yup
  .string()
  .required('forms.validations.required')
  .min(3, ({ min }) => TranslatedValidatedMessageWithPayload('forms.validations.minLength')({ min }))
  .max(25, ({ max }) => TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max }))
  .matches(/^[a-z0-9-]*$/, 'forms.validations.alphaNumeric');

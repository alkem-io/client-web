import * as yup from 'yup';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';

export const NAMEID_MAX_LENGTH = 25;

export const nameIdValidator = yup
  .string()
  .required('forms.validations.required')
  .min(3, ({ min }) => TranslatedValidatedMessageWithPayload('forms.validations.minLength')({ min }))
  .max(NAMEID_MAX_LENGTH, ({ max }) => TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max }))
  .matches(/^[a-z0-9-]*$/, 'forms.validations.alphaNumeric');

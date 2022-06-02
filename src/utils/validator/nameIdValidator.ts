import * as yup from 'yup';
import { MessageWithPayload } from '../../domain/shared/i18n/ValidationMessageTranslation';

export const nameIdValidator = yup
  .string()
  .required('forms.validations.required')
  .min(3, MessageWithPayload('forms.validations.minLength'))
  .max(25, MessageWithPayload('forms.validations.maxLength'))
  .matches(/^[a-z0-9-]*$/, 'forms.validations.alphaNumeric');

import * as yup from 'yup';
import { TranslatedValidation } from '../../domain/shared/i18n/ValidationMessageTranslation';

export const nameIdValidator = yup
  .string()
  .required('forms.validations.required')
  .min(3, TranslatedValidation('forms.validations.minLength'))
  .max(25, TranslatedValidation('forms.validations.maxLength'))
  .matches(/^[a-z0-9-]*$/, 'forms.validations.alphaNumeric');

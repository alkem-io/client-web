import * as yup from 'yup';
import { MessageWithPayload } from '../../domain/shared/i18n/ValidationMessageTranslation';

export const displayNameValidator = yup
  .string()
  .test('is-not-spaces', 'forms.validations.nonBlank', value => !value || !/^[\s]*$/.test(value))
  .required(MessageWithPayload('forms.validations.required'))
  .min(3, MessageWithPayload('forms.validations.minLength'))
  .max(128, MessageWithPayload('forms.validations.maxLength'));

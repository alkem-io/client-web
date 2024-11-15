import * as yup from 'yup';
import { MessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import { SMALL_TEXT_LENGTH } from '../field-length.constants';

export const displayNameValidator = yup
  .string()
  .test('is-not-spaces', MessageWithPayload('forms.validations.nonBlank'), value => !value || !/^[\s]*$/.test(value))
  .required(MessageWithPayload('forms.validations.required'))
  .min(3, MessageWithPayload('forms.validations.minLength'))
  .max(SMALL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength'));

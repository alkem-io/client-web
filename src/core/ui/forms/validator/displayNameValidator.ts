import * as yup from 'yup';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import { SMALL_TEXT_LENGTH } from '../field-length.constants';

export const displayNameValidator = yup
  .string()
  .test(
    'is-not-spaces',
    TranslatedValidatedMessageWithPayload('forms.validations.nonBlank'),
    value => !value || !/^[\s]*$/.test(value)
)
  .min(3, ({ min }) => TranslatedValidatedMessageWithPayload('forms.validations.minLength')({ min }))
  .max(SMALL_TEXT_LENGTH, ({ max }) => TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max }));

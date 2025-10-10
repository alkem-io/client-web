import * as yup from 'yup';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';

export const nameValidator = yup
  .string()
  .test(
    'is-not-spaces',
    TranslatedValidatedMessageWithPayload('forms.validations.nonBlank'),
    value => !value || !/^[\s]*$/.test(value)
  );

import * as yup from 'yup';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';

/**
 * URL validator that ensures URLs are valid
 */
export const urlValidator = yup
  .string()
  .test('is-valid-url', TranslatedValidatedMessageWithPayload('forms.validations.invalidUrl'), value => {
    if (!value) return false;

    try {
      const url = new URL(value);

      return !!url;
    } catch {
      return false;
    }
  });

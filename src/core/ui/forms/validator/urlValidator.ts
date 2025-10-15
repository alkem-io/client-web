import * as yup from 'yup';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import { MID_TEXT_LENGTH } from '../field-length.constants';

interface UrlValidatorOptions {
  maxLength?: number;
  required?: boolean;
}

/**
 * URL validator that ensures URLs are valid.
 *
 * @param options - Configuration object
 * @param options.maxLength - Maximum allowed length for the URL (default: MID_TEXT_LENGTH)
 * @param options.required - Whether the field is required (default: false)
 * @returns Yup string schema with URL validation
 *
 * @example
 * // Basic usage
 * urlValidator()
 *
 * @example
 * // With max length
 * urlValidator({ maxLength: MID_TEXT_LENGTH })
 *
 * @example
 * // Required URL
 * urlValidator({ required: true })
 *
 * @example
 * // With both options
 * urlValidator({ maxLength: SMALL_TEXT_LENGTH, required: true })
 */
export const urlValidator = ({ maxLength = MID_TEXT_LENGTH, required = false }: UrlValidatorOptions = {}) => {
  let validator = yup
    .string()
    .test('is-valid-url', TranslatedValidatedMessageWithPayload('forms.validations.invalidUrl'), value => {
      if (!value) {
        return true;
      }

      try {
        const url = new URL(value);
        return !!url;
      } catch {
        return false;
      }
    })
    .max(maxLength, ({ max }) => TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max }));

  if (required) {
    validator = validator.required(TranslatedValidatedMessageWithPayload('forms.validations.required'));
  }

  return validator;
};

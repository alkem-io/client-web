import * as yup from 'yup';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import { SMALL_TEXT_LENGTH } from '../field-length.constants';

/**
 * Email validator that ensures emails are valid.
 *
 * @param maxLength - Maximum allowed length for the email (default: SMALL_TEXT_LENGTH)
 * @param required - Whether the field is required (default: false)
 * @returns Yup string schema with email validation
 *
 * @example
 * // Basic usage
 * emailValidator()
 *
 * @example
 * // With max length
 * emailValidator({ maxLength: SMALL_TEXT_LENGTH })
 *
 * @example
 * // Required email
 * emailValidator({ required: true })
 *
 * @example
 * // With both options
 * emailValidator({ maxLength: MID_TEXT_LENGTH, required: true })
 */
export const emailValidator = (options?: { maxLength?: number; required?: boolean }) => {
  const { maxLength = SMALL_TEXT_LENGTH, required = false } = options || {};

  let validator = yup
    .string()
    .test('is-valid-email', TranslatedValidatedMessageWithPayload('forms.validations.invalidEmail'), value => {
      if (!value) return !required; // If not required, empty is valid

      // Basic email regex validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    })
    .max(maxLength, ({ max }) => TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max }));

  if (required) {
    validator = validator.required(TranslatedValidatedMessageWithPayload('forms.validations.required'));
  }

  return validator;
};

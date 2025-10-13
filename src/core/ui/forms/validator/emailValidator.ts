import * as yup from 'yup';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import { SMALL_TEXT_LENGTH } from '../field-length.constants';

/**
 * Base email validator without max length
 * Uses a custom test with translated error message instead of yup's built-in .email()
 * to support internationalization
 */
const baseEmailValidator = yup
  .string()
  .test('is-valid-email', TranslatedValidatedMessageWithPayload('forms.validations.invalidEmail'), value => {
    if (!value) return false;

    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  });

/**
 * Email validator that ensures emails are valid.
 *
 * Can be used in two ways:
 * 1. As a function with max length: `emailValidator(SMALL_TEXT_LENGTH)`
 * 2. As a base validator to chain: `emailValidator.required()`
 *
 * @param maxLength - Maximum allowed length for the email (default: SMALL_TEXT_LENGTH)
 * @returns Yup string schema with email validation
 *
 * @example
 * // With human-readable max length
 * emailValidator(SMALL_TEXT_LENGTH)
 *
 * @example
 * // Chain with other validators
 * emailValidator.required()
 */
export const emailValidator = Object.assign(
  (maxLength: number = SMALL_TEXT_LENGTH) =>
    baseEmailValidator.max(maxLength, ({ max }) =>
      TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max })
    ),
  baseEmailValidator
);

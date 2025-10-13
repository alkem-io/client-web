import * as yup from 'yup';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import { MID_TEXT_LENGTH } from '../field-length.constants';

/**
 * Base URL validator without max length
 */
const baseUrlValidator = yup
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

/**
 * URL validator that ensures URLs are valid.
 *
 * Can be used in two ways:
 * 1. As a function with max length: `urlValidator(MID_TEXT_LENGTH)`
 * 2. As a base validator to chain: `urlValidator.max(...).required()`
 *
 * @param maxLength - Maximum allowed length for the URL
 * @returns Yup string schema with URL validation
 *
 * @example
 * // With human-readable max length
 * urlValidator(MID_TEXT_LENGTH)
 *
 * @example
 * // Chain with other validators
 * urlValidator.max(512).required()
 */
export const urlValidator = Object.assign(
  (maxLength: number = MID_TEXT_LENGTH) =>
    baseUrlValidator.max(maxLength, ({ max }) =>
      TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max })
    ),
  baseUrlValidator
);

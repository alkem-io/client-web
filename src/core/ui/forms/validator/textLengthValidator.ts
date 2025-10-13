import * as yup from 'yup';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';

interface TextLengthValidatorOptions {
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  allowOnlySpaces?: boolean;
}

/**
 * Creates a reusable text validator with human-readable translated validation messages.
 *
 * @param options - Configuration options for the validator
 * @param options.minLength - Minimum allowed length (optional)
 * @param options.maxLength - Maximum allowed length (optional)
 * @param options.required - Whether the field is required (default: false)
 * @param options.allowOnlySpaces - Whether to allow strings with only spaces (default: false)
 *
 * @returns A yup string schema with the specified validations
 *
 * @example
 * // For display names (min 3, max SMALL_TEXT_LENGTH, no spaces-only)
 * const displayNameValidator = textLengthValidator({
 *   minLength: 3,
 *   maxLength: SMALL_TEXT_LENGTH,
 *   required: true,
 *   allowOnlySpaces: false
 * });
 *
 * @example
 * // For descriptions (max MID_TEXT_LENGTH, spaces allowed)
 * const descriptionValidator = textLengthValidator({
 *   maxLength: MID_TEXT_LENGTH,
 *   allowOnlySpaces: true
 * });
 */
export const textLengthValidator = ({
  minLength,
  maxLength,
  required = false,
  allowOnlySpaces = false,
}: TextLengthValidatorOptions = {}) => {
  let validator = yup.string();

  // Add non-blank validation if spaces are not allowed
  if (!allowOnlySpaces) {
    validator = validator.test(
      'is-not-spaces',
      TranslatedValidatedMessageWithPayload('forms.validations.nonBlank'),
      value => !value || !/^[\s]*$/.test(value)
    );
  }

  // Add minimum length validation if specified
  if (minLength !== undefined) {
    validator = validator.min(minLength, ({ min }) =>
      TranslatedValidatedMessageWithPayload('forms.validations.minLength')({ min })
    );
  }

  // Add maximum length validation (always required)
  if (maxLength !== undefined) {
    validator = validator.max(maxLength, ({ max }) =>
      TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max })
    );
  }

  // Add required validation if specified
  if (required) {
    validator = validator.required(TranslatedValidatedMessageWithPayload('forms.validations.required'));
  }

  return validator;
};

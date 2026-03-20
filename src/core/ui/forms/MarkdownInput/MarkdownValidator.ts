import { string } from 'yup';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import type { ValidationMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation/ValidationMessageWithPayload';
import type { MarkdownTextMaxLength } from '../field-length.constants';

const translationKey: TranslationKey = 'components.wysiwyg-editor.validation.maxLength';

const MarkdownValidator = (maxLength: MarkdownTextMaxLength, options?: { required?: boolean }) => {
  const base = string().max(maxLength, ({ max }) => TranslatedValidatedMessageWithPayload(translationKey)({ max }));
  return options?.required ? base.required(TranslatedValidatedMessageWithPayload('forms.validations.required')) : base;
};

export const isMarkdownMaxLengthError = (
  error: string | ValidationMessageWithPayload
): error is ValidationMessageWithPayload => {
  return typeof error !== 'string' && error.message === translationKey;
};

export default MarkdownValidator;

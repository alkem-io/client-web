import { string } from 'yup';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { ValidationMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation/ValidationMessageWithPayload';
import { MarkdownTextMaxLength } from '../field-length.constants';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';

const translationKey: TranslationKey = 'components.wysiwyg-editor.validation.maxLength';

const MarkdownValidator = (maxLength: MarkdownTextMaxLength, options?: { required?: boolean }) =>
  options?.required
    ? string()
        .max(maxLength, ({ max }) => TranslatedValidatedMessageWithPayload(translationKey)({ max }))
        .required(TranslatedValidatedMessageWithPayload('forms.validations.required'))
    : string().max(maxLength, ({ max }) => TranslatedValidatedMessageWithPayload(translationKey)({ max }));

export const isMarkdownMaxLengthError = (
  error: string | ValidationMessageWithPayload
): error is ValidationMessageWithPayload => {
  return typeof error !== 'string' && error.message === translationKey;
};

export default MarkdownValidator;

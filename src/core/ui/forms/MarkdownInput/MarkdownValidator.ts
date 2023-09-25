import { string } from 'yup';
import TranslationKey from '../../../i18n/utils/TranslationKey';
import { ValidationMessageWithPayload } from '../../../../domain/shared/i18n/ValidationMessageTranslation/ValidationMessageWithPayload';
import { MarkdownTextMaxLength } from '../field-length.constants';

const translationKey: TranslationKey = 'components.wysiwyg-editor.validation.maxLength';

const MarkdownValidator = (_maxLength: MarkdownTextMaxLength) => {
  return string();
};

export const isMarkdownMaxLengthError = (
  error: string | ValidationMessageWithPayload
): error is ValidationMessageWithPayload => {
  return typeof error !== 'string' && error.message === translationKey;
};

export default MarkdownValidator;

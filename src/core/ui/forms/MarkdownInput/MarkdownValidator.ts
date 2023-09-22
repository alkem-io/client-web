import { string } from 'yup';
import TranslationKey from '../../../i18n/utils/TranslationKey';
import { ValidationMessageWithPayload } from '../../../../domain/shared/i18n/ValidationMessageTranslation/ValidationMessageWithPayload';
import { MessageWithPayload } from '../../../../domain/shared/i18n/ValidationMessageTranslation';
import { MarkdownTextMaxLength } from '../field-length.constants';
import { TEXT_OVERFLOW_MARK } from './FormikMarkdownField';

const translationKey: TranslationKey = 'components.wysiwyg-editor.validation.maxLength';

const MarkdownValidator = (maxLength: MarkdownTextMaxLength) => {
  return string().test('MarkdownValidator', MessageWithPayload(translationKey), (value) => {
    console.log('validation', { value, length: value?.length, maxLength });
    if (value?.endsWith(TEXT_OVERFLOW_MARK)) {
      console.log('endsWith @ ! not valid!');
      return false;
    }
    return true;
  });
};//!!

export const isMarkdownMaxLengthError = (
  error: string | ValidationMessageWithPayload
): error is ValidationMessageWithPayload => {
  return typeof error !== 'string' && error.message === translationKey;
};

export default MarkdownValidator;

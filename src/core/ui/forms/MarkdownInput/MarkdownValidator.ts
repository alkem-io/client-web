import { TextFieldMaxLength } from '../field-length.constants';
import { string } from 'yup';
import { MessageWithPayload } from '../../../../domain/shared/i18n/ValidationMessageTranslation';

const MarkdownValidator = (maxLength: TextFieldMaxLength) => {
  return string().max(maxLength, MessageWithPayload('components.wysiwyg-editor.validation.maxLength'));
};

export default MarkdownValidator;

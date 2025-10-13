import { SMALL_TEXT_LENGTH } from '../field-length.constants';
import { textLengthValidator } from './textLengthValidator';

export const displayNameValidator = textLengthValidator({
  minLength: 3,
  maxLength: SMALL_TEXT_LENGTH,
  allowOnlySpaces: false,
});

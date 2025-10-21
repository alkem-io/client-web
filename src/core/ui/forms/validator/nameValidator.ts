import { textLengthValidator } from './textLengthValidator';
import { SMALL_TEXT_LENGTH } from '../field-length.constants';

export const nameValidator = textLengthValidator({
  minLength: 1,
  maxLength: SMALL_TEXT_LENGTH,
  allowOnlySpaces: false,
});

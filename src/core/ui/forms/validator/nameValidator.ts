import { SMALL_TEXT_LENGTH } from '../field-length.constants';
import { textLengthValidator } from './textLengthValidator';

export const nameValidator = textLengthValidator({
  minLength: 1,
  maxLength: SMALL_TEXT_LENGTH,
  allowOnlySpaces: false,
});

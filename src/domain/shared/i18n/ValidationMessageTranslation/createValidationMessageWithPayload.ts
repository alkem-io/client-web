import TranslationKey from '../../../../types/TranslationKey';
import { ValidationMessageWithPayload } from './ValidationMessageWithPayload';

const createValidationMessageWithPayload = (
  translationKey: TranslationKey,
  payload: Partial<Record<string, string | number>>
): ValidationMessageWithPayload => ({
  message: translationKey,
  ...payload,
});

export default createValidationMessageWithPayload;

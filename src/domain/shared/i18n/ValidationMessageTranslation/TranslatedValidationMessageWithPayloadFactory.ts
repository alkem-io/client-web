import TranslationKey from '../../../../types/TranslationKey';
import { ValidationMessageWithPayload } from './ValidationMessageWithPayload';

const translatedValidationMessageWithPayloadFactory =
  (translationKey: TranslationKey) =>
  (payload: Partial<Record<string, string | number>>): ValidationMessageWithPayload => ({
    message: translationKey,
    ...payload,
  });

export default translatedValidationMessageWithPayloadFactory;

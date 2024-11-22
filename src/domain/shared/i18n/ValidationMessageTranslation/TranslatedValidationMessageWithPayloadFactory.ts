import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { ValidationMessageWithPayload } from './ValidationMessageWithPayload';

const translatedValidationMessageWithPayloadFactory =
  (translationKey: TranslationKey) =>
  (payload: Partial<Record<string, string | number>>): ValidationMessageWithPayload => ({
    message: translationKey,
    ...payload,
  });

export default translatedValidationMessageWithPayloadFactory;

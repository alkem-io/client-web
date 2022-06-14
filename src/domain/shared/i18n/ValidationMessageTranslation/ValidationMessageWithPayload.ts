import TranslationKey from '../../../../types/TranslationKey';

export interface ValidationMessageWithPayload extends Record<string, string | number> {
  message: TranslationKey;
}

import TranslationKey from '@/core/i18n/utils/TranslationKey';

export interface ValidationMessageWithPayload extends Record<string, string | number> {
  message: TranslationKey;
}

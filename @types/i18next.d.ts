import 'i18next';
import { defaultNS } from '@/core/i18n/config';
import type enTranslation from '@/core/i18n/en/translation.en.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: {
      translation: typeof enTranslation;
    };
  }
}

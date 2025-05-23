import 'i18next';
import { resources, defaultNS } from '@/core/i18n/config';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof resources['en'];
  }
}

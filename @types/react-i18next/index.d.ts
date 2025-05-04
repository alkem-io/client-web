import 'react-i18next';
import { resources } from '../../src/core/i18n/config';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: typeof resources['en'];
  }
}

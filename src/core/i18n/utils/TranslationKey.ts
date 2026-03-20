import type { ParseKeys } from 'i18next';
import type { defaultNS } from '@/core/i18n/config';

type TranslationKey = ParseKeys<typeof defaultNS>;

export default TranslationKey;

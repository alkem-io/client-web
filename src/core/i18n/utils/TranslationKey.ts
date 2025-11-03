import { ParseKeys } from 'i18next';
import { defaultNS } from '@/core/i18n/config';

type TranslationKey = ParseKeys<typeof defaultNS>;

export default TranslationKey;

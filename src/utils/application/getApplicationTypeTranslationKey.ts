import { ApplicationType } from './getApplicationWithType';
import TranslationKey from '../../types/TranslationKey';

const i18nTypeDic: Record<ApplicationType, TranslationKey> = {
  [ApplicationType.HUB]: 'common.ecoverse',
  [ApplicationType.CHALLENGE]: 'common.challenge',
  [ApplicationType.OPPORTUNITY]: 'common.opportunity',
} as const;

const getApplicationTypeTranslationKey = (type: ApplicationType): TranslationKey => i18nTypeDic[type];
export default getApplicationTypeTranslationKey;

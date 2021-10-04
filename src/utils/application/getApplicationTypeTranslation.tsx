import ApplicationTypeEnum from '../../models/application-type';
import TranslationKey from '../../types/TranslationKey';

const applicationTypeTranslationKeyDict: Record<ApplicationTypeEnum, TranslationKey> = {
  [ApplicationTypeEnum.HUB]: 'common.ecoverse',
  [ApplicationTypeEnum.CHALLENGE]: 'common.challenge',
  [ApplicationTypeEnum.OPPORTUNITY]: 'common.opportunity',
} as const;

const getApplicationTypeTranslationKey = (type: ApplicationTypeEnum): TranslationKey =>
  applicationTypeTranslationKeyDict[type];
export default getApplicationTypeTranslationKey;

import { ApplicationTypeEnum } from '../../models/enums/application-type';
import TranslationKey from '../../types/TranslationKey';

const applicationTypeTranslationKeyDict: Record<ApplicationTypeEnum, TranslationKey> = {
  [ApplicationTypeEnum.ecoverse]: 'common.ecoverse',
  [ApplicationTypeEnum.challenge]: 'common.challenge',
  [ApplicationTypeEnum.opportunity]: 'common.opportunity',
} as const;

const getApplicationTypeTranslationKey = (type: ApplicationTypeEnum): TranslationKey =>
  applicationTypeTranslationKeyDict[type];
export default getApplicationTypeTranslationKey;

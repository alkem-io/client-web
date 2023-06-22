import { ApplicationTypeEnum } from '../../../domain/community/application/constants/ApplicationType';
import TranslationKey from '../../../types/TranslationKey';

const getApplicationTypeKey = (type: ApplicationTypeEnum): TranslationKey => {
  switch (type) {
    case ApplicationTypeEnum.space:
      return 'common.space';
    case ApplicationTypeEnum.challenge:
      return 'common.challenge';
    case ApplicationTypeEnum.opportunity:
      return 'common.opportunity';
    default:
      return 'common.empty-string';
  }
};

export default getApplicationTypeKey;

import { JourneyTypeName } from '../../../domain/challenge/JourneyTypeName';
import TranslationKey from '../../../types/TranslationKey';

const getJourneyChildrenTranslationKey = (type: JourneyTypeName, plural: boolean = true): TranslationKey => {
  switch (type) {
    case 'space':
      return plural ? 'common.challenges' : 'common.challenge';
    case 'challenge':
      return plural ? 'common.opportunities' : 'common.opportunity';
    case 'opportunity':
      return plural ? 'common.agreements' : 'common.agreement';
  }
};

export default getJourneyChildrenTranslationKey;

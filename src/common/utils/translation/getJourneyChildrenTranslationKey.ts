import { JourneyTypeName } from '../../../domain/challenge/JourneyTypeName';
import TranslationKey from '../../../types/TranslationKey';

const getJourneyChildrenTranslationKey = (type: JourneyTypeName): TranslationKey => {
  switch (type) {
    case 'space':
      return 'common.challenges';
    case 'challenge':
      return 'common.opportunities';
    case 'opportunity':
      return 'common.agreements';
  }
};

export default getJourneyChildrenTranslationKey;

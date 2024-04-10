import TranslationKey from '../../../../core/i18n/utils/TranslationKey';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';

const getApplicationTypeKey = (type: JourneyTypeName): TranslationKey => {
  switch (type) {
    case 'space':
      return 'common.space';
    case 'subspace':
      return 'common.subspace';
    case 'subsubspace':
      return 'common.opportunity';
    default:
      return 'common.empty-string';
  }
};

export default getApplicationTypeKey;

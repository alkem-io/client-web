import { TFunction } from 'react-i18next';
import { JourneyTypeName } from '../JourneyTypeName';

const getJourneyChildrenTranslation = (
  t: TFunction<'translation', undefined>,
  type: JourneyTypeName,
  count: number = 0
): string => {
  switch (type) {
    case 'space':
      return t('common.journeyTypes.subspace', { count });
    case 'challenge':
      return t('common.journeyTypes.subspace', { count });
    case 'opportunity':
      return t('common.journeyTypes.agreement', { count });
  }
};

export default getJourneyChildrenTranslation;

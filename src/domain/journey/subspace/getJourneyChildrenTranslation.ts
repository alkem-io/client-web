import { TFunction } from 'react-i18next';
import { JourneyTypeName } from '../JourneyTypeName';

/**
 * @deprecated remove, all child journeys are now called subspace
 */
const getJourneyChildrenTranslation = (
  t: TFunction<'translation', undefined>,
  type: JourneyTypeName,
  count: number = 0
): string => {
  switch (type) {
    case 'space':
      return t('common.journeyTypes.subspace', { count });
    case 'subspace':
      return t('common.journeyTypes.subspace', { count });
    case 'subsubspace':
      return t('common.journeyTypes.agreement', { count });
  }
};

export default getJourneyChildrenTranslation;

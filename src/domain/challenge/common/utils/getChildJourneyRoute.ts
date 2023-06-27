import { JourneyTypeName } from '../../JourneyTypeName';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';

const getChildJourneyRoute = (type: JourneyTypeName): EntityPageSection => {
  switch (type) {
    case 'space':
      return EntityPageSection.Challenges;
    case 'challenge':
      return EntityPageSection.Opportunities;
    case 'opportunity':
      return EntityPageSection.Agreements;
  }
};

export default getChildJourneyRoute;

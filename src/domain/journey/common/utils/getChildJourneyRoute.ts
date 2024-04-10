import { JourneyTypeName } from '../../JourneyTypeName';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';

const getChildJourneyRoute = (type: JourneyTypeName): EntityPageSection => {
  switch (type) {
    case 'space':
      return EntityPageSection.Subspaces;
    case 'subspace':
      return EntityPageSection.Subsubspaces;
    case 'subsubspace':
      return EntityPageSection.Agreements;
  }
};

export default getChildJourneyRoute;

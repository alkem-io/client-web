import { JourneyTypeName } from '../../JourneyTypeName';

const getParentJourneyType = (journeyType: JourneyTypeName): JourneyTypeName | null => {
  switch (journeyType) {
    case 'challenge':
      return 'hub';
    case 'opportunity':
      return 'challenge';
    case 'hub':
      return null;
  }
};

export default getParentJourneyType;

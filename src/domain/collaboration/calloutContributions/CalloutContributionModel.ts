import { Identifiable } from '@/core/utils/Identifiable';

type CalloutContributionModel = Identifiable & {
  post?: {
    id: string;
    profile: {
      displayName: string;
      description?: string;
      url: string;
    };
    comments: {
      id: string;
    };
  };
  whiteboard?: {
    id: string;
    profile: {
      preview?: { uri: string };
    };
  };
};

export default CalloutContributionModel;

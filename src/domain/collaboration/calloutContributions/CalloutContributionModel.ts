import { Identifiable } from '@/core/utils/Identifiable';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';

type CalloutContributionModel = Identifiable & {
  post?: {
    id: string;
    profile: {
      displayName: string;
      description?: string;
      tagset?: {
        tags: string[];
      };
      references?: ReferenceModel[];
      url: string;
    };
    comments: {
      id: string;
      messagesCount: number;
    };
  };
  whiteboard?: {
    id: string;
    profile: {
      preview?: { uri: string };
    };
  };
  memo?: {
    id: string;
    profile: {
      displayName: string;
      url: string;
    };
    markdown?: string;
  };
};

export default CalloutContributionModel;

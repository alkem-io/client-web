import { AuthorizationPrivilege, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { WhiteboardDetails } from '../../whiteboard/WhiteboardDialog/WhiteboardDialog';
import { MemoModel } from '../../memo/model/MemoModel';
import { ClassificationTagsetWithAllowedValuesModel } from '../../calloutsSet/Classification/ClassificationTagset.model';
import { CalloutSettingsModelFull } from './CalloutSettingsModel';
import { ContributionDefaultsModel } from './ContributionDefaultsModel';
import { CalloutModelExtension, CalloutModelLight } from './CalloutModelLight';
import { VisualModel } from '@/domain/common/visual/model/VisualModel';
import { LinkDetails } from '../CalloutContributions/link/models/LinkDetails';
import { Identifiable } from '@/core/utils/Identifiable';

type ContributorModel = {
  __typename?: string; // 'Organization' | 'User' | 'VirtualContributor';
  id: string;
  profile: {
    id: string;
    displayName: string;
    url: string;
    description?: string;
    avatar?: VisualModel;
    tagsets?: TagsetModel[];
    location?: {
      country?: string;
      city?: string;
    };
  };
};

type CommentsWithMessagesModel = {
  id: string;
  messagesCount: number;
  authorization?: { myPrivileges?: AuthorizationPrivilege[] };
  messages: {
    id: string;
    message: string;
    timestamp: number;
    threadID?: string;
    reactions: {
      id: string;
      emoji: string;
      sender?: { id: string; profile: { displayName: string } };
    }[];
    sender?: ContributorModel;
  }[];
  vcInteractions: { id: string; threadID: string; virtualContributorID: string }[];
};

export type CalloutDetailsModel = CalloutModelLight & {
  framing: {
    profile: {
      id: string;
      displayName: string;
      description?: string;
      tagset?: TagsetModel;
      references?: ReferenceModel[];
      url: string;
      storageBucket: {
        id: string;
      };
    };
    type: CalloutFramingType;
    whiteboard?: WhiteboardDetails;
    memo?: MemoModel;
    link?: LinkDetails;
  };
  classification?: {
    flowState?: ClassificationTagsetWithAllowedValuesModel;
  };
  settings: CalloutSettingsModelFull;
  contributionDefaults: ContributionDefaultsModel;
  comments?: CommentsWithMessagesModel | undefined;
  contributions: (Identifiable & { sortOrder: number })[]
};

/**
 * Extended CalloutDetailsModel with additional properties useful for the UI
 * Information queried and extended by the hook useCalloutsSet
 */
export type CalloutDetailsModelExtended = CalloutModelExtension<CalloutDetailsModel>;

export type CalloutDetailsWithContributions = CalloutDetailsModelExtended & {
  contributions: {

  }
}
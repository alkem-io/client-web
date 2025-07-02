import { AuthorizationPrivilege, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import {
  ClassificationTagsetModel,
  ClassificationTagsetWithAllowedValuesModel,
} from '../../calloutsSet/Classification/ClassificationTagset.model';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { VisualModel } from '@/domain/common/visual/model/VisualModel';
import { CalloutSettingsModelFull } from './CalloutSettingsModel';
import { CalloutModelLight } from './CalloutModelLight';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { WhiteboardDetails } from '../../whiteboard/WhiteboardDialog/WhiteboardDialog';

// TODO: TypedCallout and CalloutModel requires a refactor to avoid duplication
// TypedCallout was created long ago to provide CalloutModel data + a few additional fields useful for the UI,
// TypedCallout is quite basic information, then TypedCalloutDetails has more details, and TypedCalloutDetailsWithContributions includes the contributions.

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

export type TypedCallout = CalloutModelLight & {
  authorization?: { myPrivileges?: AuthorizationPrivilege[] };
  draft: boolean;
  editable: boolean;
  movable: boolean;
  canBeSavedAsTemplate: boolean;
  classificationTagsets: ClassificationTagsetModel[];
  authorName?: string;
  authorAvatarUri?: string;
  publishedAt?: string;
};

export type TypedCalloutDetails = TypedCallout & {
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
  };
  classification?: {
    flowState?: ClassificationTagsetWithAllowedValuesModel;
  };
  settings: CalloutSettingsModelFull;
  contributionDefaults: {
    defaultDisplayName?: string;
    postDescription?: string;
    whiteboardContent?: string;
  };
  comments?: CommentsWithMessagesModel | undefined;
};

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
import { LinkDetails } from '../../callout/links/LinkCollectionCallout';
import { WhiteboardDetails } from '../../whiteboard/WhiteboardDialog/WhiteboardDialog';
//!! split these

/*
export type WhiteboardDetailsModel = {
  id: string;
  nameID: string;
  createdDate: Date | string;
  profile: {
    displayName: string;
    visual?: VisualModel;
    preview?: VisualModel;
  };
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  }
  contentUpdatePolicy: ContentUpdatePolicy;
  createdBy?: {
    id
    profile: {
      displayName: string;
      url: string;
      location?: {
        country?: string;
        city?: string;
      }
      avatar?: {
        uri: string;
      }
    }
  }
}
*/
export type PostModel = {
  id: string;
  profile: {
    displayName: string;
    description?: string;
  };
};

export type ContributorModel = {
  __typename?: string; // 'Organization' | 'User' | 'VirtualContributor';
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

export type CommentsWithMessagesModel = {
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
    postDescription?: string;
    whiteboardContent?: string;
  };
  comments?: CommentsWithMessagesModel | undefined;
};

export type TypedCalloutDetailsWithContributions = TypedCalloutDetails & {
  contributions: {
    id?: string;
    sortOrder?: number;
    link?: LinkDetails;
    post?: PostModel;
    whiteboard?: WhiteboardDetails;
  }[];
};

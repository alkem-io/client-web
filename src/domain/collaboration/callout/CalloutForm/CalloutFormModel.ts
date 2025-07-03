import {
  CalloutAllowedContributors,
  CalloutFramingType,
  CalloutVisibility,
} from '@/core/apollo/generated/graphql-schema';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { EmptyTagset, TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { WhiteboardFieldSubmittedValuesWithPreviewImages } from '../../whiteboard/WhiteboardPreview/WhiteboardField';
import { CalloutStructuredResponseType } from './CalloutForm';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import { ContributionDefaultsModel } from '../models/ContributionDefaultsModel';

export interface CalloutFormSubmittedValues {
  framing: {
    profile: {
      id?: string;
      displayName: string;
      description: string;
      tagsets: TagsetModel[];
      references: ReferenceModel[];
    };
    type: CalloutFramingType;
    whiteboard: WhiteboardFieldSubmittedValuesWithPreviewImages | undefined;
  };
  contributionDefaults: ContributionDefaultsModel;
  contributions?: {
    links?: ReferenceModel[];
  };
  settings: {
    contribution: {
      enabled: boolean;
      allowedTypes: CalloutStructuredResponseType;
      canAddContributions: CalloutAllowedContributors;
      commentsEnabled: boolean;
    };
    framing: {
      commentsEnabled: boolean;
    };
    visibility: CalloutVisibility;
  };
}

export const DefaultCalloutFormValues: CalloutFormSubmittedValues = {
  framing: {
    profile: {
      displayName: '',
      description: '',
      tagsets: [EmptyTagset],
      references: [],
    },
    type: CalloutFramingType.None,
    whiteboard: undefined,
  },
  contributionDefaults: {
    defaultDisplayName: '',
    postDescription: '',
    whiteboardContent: EmptyWhiteboardString,
  },
  contributions: {
    links: [],
  },
  settings: {
    contribution: {
      enabled: true,
      allowedTypes: 'none' as CalloutStructuredResponseType,
      canAddContributions: CalloutAllowedContributors.Members,
      commentsEnabled: true,
    },
    framing: {
      commentsEnabled: true,
    },
    visibility: CalloutVisibility.Published,
  },
};

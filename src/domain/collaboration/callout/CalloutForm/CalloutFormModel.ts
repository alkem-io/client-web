import {
  CalloutAllowedActors,
  CalloutFramingType,
  CalloutVisibility,
  type VisualType,
} from '@/core/apollo/generated/graphql-schema';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { EmptyTagset, type TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import type { MemoFieldSubmittedValues } from '../../memo/model/MemoFieldSubmittedValues';
import type { WhiteboardFieldSubmittedValuesWithPreviewImages } from '../../whiteboard/WhiteboardPreview/WhiteboardField';
import type { ContributionDefaultsModel } from '../models/ContributionDefaultsModel';
import type { CalloutStructuredResponseType } from './CalloutForm';
import type { PollFormValues } from '../../poll/models/PollModels';

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
    memo: MemoFieldSubmittedValues | undefined;
    link?: {
      id?: string;
      uri: string;
      profile: {
        displayName: string;
      };
    };
    mediaGallery?: {
      visuals: {
        id?: string;
        /** Stable client-side identifier for new visuals that don't yet have a server id. Used as React key and @dnd-kit sortable id. */
        clientId?: string;
        uri: string | undefined;
        /**
         * Optional local file to upload as part of the media gallery visual.
         * When present, the uri is only used for local preview purposes.
         */
        file?: File;
        previewUrl?: string;
        name?: string;
        alternativeText?: string;
        visualType?: VisualType;
        sortOrder?: number;
      }[];
    };
    poll?: PollFormValues;
  };
  contributionDefaults: ContributionDefaultsModel;
  contributions?: {
    links?: ReferenceModel[];
  };
  settings: {
    contribution: {
      enabled: boolean;
      allowedTypes: CalloutStructuredResponseType;
      canAddContributions: CalloutAllowedActors;
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
    memo: undefined,
    link: undefined,
    mediaGallery: { visuals: [] },
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
      canAddContributions: CalloutAllowedActors.Members,
      commentsEnabled: true,
    },
    framing: {
      commentsEnabled: true,
    },
    visibility: CalloutVisibility.Published,
  },
};

export const isEmptyCalloutForm = (calloutFormData: CalloutFormSubmittedValues | undefined): boolean => {
  if (!calloutFormData) {
    return true;
  }
  if (
    !calloutFormData.framing.profile.displayName &&
    !calloutFormData.framing.profile.description &&
    !calloutFormData.framing.whiteboard?.content &&
    calloutFormData.framing.profile.tagsets.every(tagset => tagset.tags.length === 0) &&
    calloutFormData.settings.contribution.allowedTypes === 'none'
  ) {
    return true;
  }
  return false;
};

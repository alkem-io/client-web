import { useState } from 'react';
import { CalloutFragmentDoc, useCreateCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import type {
  CalloutAllowedActors,
  CalloutContributionType,
  CalloutFramingType,
  CalloutVisibility,
  CollaboraDocumentType,
  CreateCalloutContributionInput,
  CreateCalloutContributorsSettingsInput,
  CreateCalloutMutation,
  CreateCalloutOnCalloutsSetInput,
  CreateReferenceInput,
  CreateTagsetInput,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import type { LinkFramingFieldSubmittedValues } from '../../callout/CalloutFramings/LinkFramingFieldSubmittedValues';
import type { ContributionDefaultsModel } from '../../callout/models/ContributionDefaultsModel';
import type { PollFormFieldSubmittedValues } from '../../poll/models/PollModels';
import type { WhiteboardFieldSubmittedValues } from '../../whiteboard/WhiteboardPreview/WhiteboardField';
import { useCalloutsSetAuthorization } from '../authorization/useCalloutsSetAuthorization';

export interface CalloutCreationType {
  classification?: {
    tagsets: CreateTagsetInput[];
  };
  framing: {
    type: CalloutFramingType;
    profile: {
      displayName: string;
      description?: string;
      referencesData?: CreateReferenceInput[];
      tagsets?: CreateTagsetInput[];
    };
    whiteboard?: WhiteboardFieldSubmittedValues;
    /**
     * Collabora-document framing input. On the blank-create path, both fields are sent.
     * On the upload path, both are omitted (server derives `documentType` from the
     * uploaded file's MIME and defaults `displayName` from the filename when absent).
     */
    collaboraDocument?: {
      displayName?: string;
      documentType?: CollaboraDocumentType;
    };
    tags?: string[];
    link?: LinkFramingFieldSubmittedValues;
    mediaGallery?: {
      nameID?: string;
      visuals: {
        aspectRatio: number;
        maxHeight: number;
        maxWidth: number;
        minHeight: number;
        minWidth: number;
        name: VisualType;
        uri: string;
        alternativeText?: string;
      }[];
    };
    poll?: PollFormFieldSubmittedValues;
  };
  settings?: {
    framing?: {
      commentsEnabled?: boolean;
      /** Contributor-collection config — set only for CONTRIBUTORS framing (feature 008). */
      contributors?: CreateCalloutContributorsSettingsInput;
    };
    contribution?: {
      enabled?: boolean;
      allowedTypes?: CalloutContributionType[];
      canAddContributions?: CalloutAllowedActors;
      commentsEnabled?: boolean;
    };
    visibility?: CalloutVisibility;
  };
  contributions?: CreateCalloutContributionInput[];
  contributionDefaults?: ContributionDefaultsModel;
  sendNotification?: boolean;
}

export interface CalloutCreationParams {
  calloutsSetId?: string;
  initialOpened?: boolean;
}

export interface CalloutCreationUtils {
  handleCreateCallout: (
    callout: CalloutCreationType,
    file?: File
  ) => Promise<CreateCalloutMutation['createCalloutOnCalloutsSet'] | undefined>;
  loading: boolean;
  canCreateCallout: boolean;
}

export const useCalloutCreation = ({ calloutsSetId }: CalloutCreationParams): CalloutCreationUtils => {
  const [isCreating, setIsCreating] = useState(false);

  const { canCreateCallout, loading } = useCalloutsSetAuthorization({ calloutsSetId });

  const [createCallout] = useCreateCalloutMutation({
    update: (cache, { data }) => {
      if (!data || !calloutsSetId) {
        return;
      }
      const { createCalloutOnCalloutsSet } = data;

      const calloutsSetRefId = cache.identify({
        __typename: 'CalloutsSet',
        id: calloutsSetId,
      });

      if (!calloutsSetRefId) {
        return;
      }

      cache.modify({
        id: calloutsSetRefId,
        fields: {
          callouts(existing = []) {
            const newCalloutRef = cache.writeFragment({
              data: createCalloutOnCalloutsSet,
              fragment: CalloutFragmentDoc,
              fragmentName: 'Callout',
            });
            return [...existing, newCalloutRef];
          },
        },
      });
    },
    refetchQueries: ['CalloutsSetTags'],
  });

  const handleCreateCallout = async (callout: CalloutCreationType, file?: File) => {
    if (!calloutsSetId) {
      return;
    }

    setIsCreating(true);

    const calloutData: CreateCalloutOnCalloutsSetInput = {
      calloutsSetID: calloutsSetId,
      ...callout,
    };

    try {
      const result = await createCallout({
        variables: file ? { calloutData, file } : { calloutData },
      });

      return result.data?.createCalloutOnCalloutsSet;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    handleCreateCallout,
    loading: loading || isCreating,
    canCreateCallout: canCreateCallout && !loading,
  };
};

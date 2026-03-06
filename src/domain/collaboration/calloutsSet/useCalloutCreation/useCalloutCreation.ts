import { useCallback, useState } from 'react';
import { CalloutFragmentDoc, useCreateCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  CalloutAllowedContributors,
  CalloutContributionType,
  CalloutFramingType,
  CalloutVisibility,
  CreateCalloutContributionInput,
  CreateCalloutMutation,
  CreateCalloutOnCalloutsSetInput,
  CreateReferenceInput,
  CreateTagsetInput,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import { WhiteboardFieldSubmittedValues } from '../../whiteboard/WhiteboardPreview/WhiteboardField';
import { useCalloutsSetAuthorization } from '../authorization/useCalloutsSetAuthorization';
import { ContributionDefaultsModel } from '../../callout/models/ContributionDefaultsModel';

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
    tags?: string[];
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
  };
  settings?: {
    framing?: {
      commentsEnabled?: boolean;
    };
    contribution?: {
      enabled?: boolean;
      allowedTypes?: CalloutContributionType[];
      canAddContributions?: CalloutAllowedContributors;
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
    callout: CalloutCreationType
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

  const handleCreateCallout = useCallback(
    async (callout: CalloutCreationType) => {
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
          variables: {
            calloutData,
          },
        });

        return result.data?.createCalloutOnCalloutsSet;
      } finally {
        setIsCreating(false);
      }
    },
    [calloutsSetId, createCallout]
  );

  return {
    handleCreateCallout,
    loading: loading || isCreating,
    canCreateCallout: canCreateCallout && !loading,
  };
};

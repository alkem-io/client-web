import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../models/container';
import { PushFunc, RemoveFunc, useApolloErrorHandler, useEditReference, useNotification } from '../../../hooks';
import {
  useChallengeAspectSettingsQuery,
  useDeleteAspectMutation,
  useHubAspectSettingsQuery,
  useOpportunityAspectSettingsQuery,
  useUpdateAspectMutation,
} from '../../../hooks/generated/graphql';
import { Aspect, AspectSettingsFragment } from '../../../models/graphql-schema';
import { Reference } from '../../../models/Profile';
import { newReferenceName } from '../../../common/utils/newReferenceName';
import removeFromCache from '../../../domain/shared/utils/apollo-cache/removeFromCache';
import { getCardCallout } from '../getAspectCallout';

type AspectUpdateData = Pick<Aspect, 'id' | 'displayName' | 'description' | 'type'> & {
  tags: string[];
  references?: Reference[];
};

export interface AspectSettingsContainerEntities {
  aspect?: AspectSettingsFragment;
  aspectsNames?: string[] | undefined;
}

export interface AspectSettingsContainerActions {
  handleUpdate: (aspect: AspectUpdateData) => void;
  handleAddReference: (push: PushFunc) => void;
  handleRemoveReference?: (ref: Reference, remove: RemoveFunc) => void;
  handleDelete: (id: string) => Promise<void>;
}

export interface AspectSettingsContainerState {
  loading: boolean;
  updating: boolean;
  deleting: boolean;
  error?: ApolloError;
  updateError?: ApolloError;
}

export interface AspectSettingsContainerProps
  extends ContainerChildProps<
    AspectSettingsContainerEntities,
    AspectSettingsContainerActions,
    AspectSettingsContainerState
  > {
  hubNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
  aspectNameId: string;
  calloutNameId: string;
}

const AspectSettingsContainer: FC<AspectSettingsContainerProps> = ({
  children,
  hubNameId,
  aspectNameId,
  challengeNameId,
  opportunityNameId,
  calloutNameId,
}) => {
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
  const { addReference, deleteReference, setPush, setRemove } = useEditReference();
  const isAspectDefined = aspectNameId && hubNameId;

  const {
    data: hubData,
    loading: hubLoading,
    error: hubError,
  } = useHubAspectSettingsQuery({
    variables: { hubNameId, aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const parentCalloutFromHub = getCardCallout(hubData?.hub?.collaboration?.callouts, aspectNameId);
  const parentCalloutAspectNamesFromHub = parentCalloutFromHub?.aspectNames?.map(x => x.displayName);
  const hubAspect = parentCalloutFromHub?.aspects?.find(x => x.nameID === aspectNameId);

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengeAspectSettingsQuery({
    variables: { hubNameId, challengeNameId: challengeNameId ?? '', aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const parentCalloutFromChallenge = getCardCallout(
    challengeData?.hub?.challenge?.collaboration?.callouts,
    aspectNameId
  );
  const parentCalloutAspectNamesFromChallenge = parentCalloutFromChallenge?.aspectNames?.map(x => x.displayName);
  const challengeAspect = parentCalloutFromChallenge?.aspects?.find(x => x.nameID === aspectNameId);

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityAspectSettingsQuery({
    variables: { hubNameId, opportunityNameId: opportunityNameId ?? '', aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !opportunityNameId,
    onError: handleError,
  });
  const parentCalloutFromOpportunity = getCardCallout(
    opportunityData?.hub?.opportunity?.collaboration?.callouts,
    aspectNameId
  );
  const parentCalloutAspectNamesFromOpportunity = parentCalloutFromOpportunity?.aspectNames?.map(x => x.displayName);
  const opportunityAspect = parentCalloutFromOpportunity?.aspects?.find(x => x.nameID === aspectNameId);

  const aspect = hubAspect ?? challengeAspect ?? opportunityAspect;
  const parentCalloutAspectNames =
    parentCalloutAspectNamesFromHub ?? parentCalloutAspectNamesFromChallenge ?? parentCalloutAspectNamesFromOpportunity;
  const loading = hubLoading || challengeLoading || opportunityLoading;
  const error = hubError ?? challengeError ?? opportunityError;

  const [updateAspect, { loading: updating, error: updateError }] = useUpdateAspectMutation({
    onError: handleError,
    onCompleted: () => notify('Aspect updated successfully', 'success'),
  });

  const handleUpdate = (aspect: AspectUpdateData) => {
    updateAspect({
      variables: {
        input: {
          ID: aspect.id,
          displayName: aspect.displayName,
          description: aspect.description,
          type: aspect.type,
          tags: aspect.tags,
          references: aspect.references?.map(x => ({
            ID: x.id ?? '',
            name: x.name,
            description: x.description,
            uri: x.uri,
          })),
        },
      },
    });
  };

  const [deleteAspect, { loading: deleting }] = useDeleteAspectMutation({
    onError: handleError,
    update: removeFromCache,
  });

  const handleDelete = async (id: string) => {
    await deleteAspect({
      variables: {
        input: {
          ID: id,
        },
      },
    });
  };

  const handleAddReference = (push: PushFunc) => {
    setPush(push);
    if (aspect?.id) {
      addReference({
        aspectId: aspect.id,
        name: newReferenceName(aspect?.references?.length ?? 0),
      });
    }
  };

  const handleRemoveReference = (ref: Reference, removeFn: RemoveFunc) => {
    setRemove(removeFn);
    if (ref.id) {
      deleteReference(ref.id);
    }
  };

  return (
    <>
      {children(
        { aspect, aspectsNames: parentCalloutAspectNames },
        { loading, error, updating, deleting, updateError },
        { handleUpdate, handleAddReference, handleRemoveReference, handleDelete }
      )}
    </>
  );
};
export default AspectSettingsContainer;

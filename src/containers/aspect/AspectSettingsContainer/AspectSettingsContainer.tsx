import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerProps } from '../../../models/container';
import { PushFunc, RemoveFunc, useApolloErrorHandler, useEditReference, useNotification } from '../../../hooks';
import {
  useChallengeAspectSettingsQuery,
  useHubAspectSettingsQuery,
  useOpportunityAspectSettingsQuery,
  useUpdateAspectMutation,
} from '../../../hooks/generated/graphql';
import { Aspect, AspectSettingsFragment } from '../../../models/graphql-schema';
import { Reference } from '../../../models/Profile';
import { newReferenceName } from '../../../utils/newReferenceName';

type AspectUpdateData = Pick<Aspect, 'id' | 'displayName' | 'defaultDescription' | 'typeDescription'> & {
  tags: string[];
  references?: Reference[];
};

export interface AspectSettingsContainerEntities {
  aspect?: AspectSettingsFragment;
}

export interface AspectSettingsContainerActions {
  handleUpdate: (aspect: AspectUpdateData) => void;
  handleAddReference: (push: PushFunc) => void;
  handleRemoveReference?: (ref: Reference, remove: RemoveFunc) => void;
}

export interface AspectSettingsContainerState {
  loading: boolean;
  updating: boolean;
  error?: ApolloError;
  updateError?: ApolloError;
}

export interface AspectSettingsContainerProps
  extends ContainerProps<
    AspectSettingsContainerEntities,
    AspectSettingsContainerActions,
    AspectSettingsContainerState
  > {
  hubNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
  aspectNameId: string;
}

const AspectSettingsContainer: FC<AspectSettingsContainerProps> = ({
  children,
  hubNameId,
  aspectNameId,
  challengeNameId = '',
  opportunityNameId = '',
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
    variables: { hubNameId, aspectNameId },
    skip: !isAspectDefined || !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubAspect = hubData?.hub?.context?.aspects?.[0];

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengeAspectSettingsQuery({
    variables: { hubNameId, challengeNameId, aspectNameId },
    skip: !isAspectDefined || !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeAspect = challengeData?.hub?.challenge?.context?.aspects?.[0];

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityAspectSettingsQuery({
    variables: { hubNameId, opportunityNameId, aspectNameId },
    skip: !isAspectDefined || !opportunityNameId,
    onError: handleError,
  });
  const opportunityAspect = opportunityData?.hub?.opportunity?.context?.aspects?.[0];

  const aspect = hubAspect ?? challengeAspect ?? opportunityAspect;
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
          defaultDescription: aspect.defaultDescription,
          typeDescription: aspect.typeDescription,
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
        { aspect },
        { loading, error, updating, updateError },
        { handleUpdate, handleAddReference, handleRemoveReference }
      )}
    </>
  );
};
export default AspectSettingsContainer;

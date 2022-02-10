import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerProps } from '../../../models/container';
import { useApolloErrorHandler } from '../../../hooks';
import {
  useChallengeAspectSettingsQuery,
  useHubAspectSettingsQuery,
  useOpportunityAspectSettingsQuery,
  useUpdateAspectMutation,
} from '../../../hooks/generated/graphql';
import { Aspect, AspectSettingsFragment } from '../../../models/graphql-schema';

type AspectUpdateData = Pick<Aspect, 'id' | 'displayName' | 'description'> & { tags: string[] };

export interface AspectSettingsContainerEntities {
  aspect?: AspectSettingsFragment;
}

export interface AspectSettingsContainerActions {
  handleUpdate: (aspect: AspectUpdateData) => void;
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
  const hubAspect = hubData?.ecoverse?.context?.aspects?.[0];

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengeAspectSettingsQuery({
    variables: { hubNameId, challengeNameId, aspectNameId },
    skip: !isAspectDefined || !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeAspect = challengeData?.ecoverse?.challenge?.context?.aspects?.[0];

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityAspectSettingsQuery({
    variables: { hubNameId, opportunityNameId, aspectNameId },
    skip: !isAspectDefined || !opportunityNameId,
    onError: handleError,
  });
  const opportunityAspect = opportunityData?.ecoverse?.opportunity?.context?.aspects?.[0];

  const aspect = hubAspect ?? challengeAspect ?? opportunityAspect;
  const loading = hubLoading || challengeLoading || opportunityLoading;
  const error = hubError ?? challengeError ?? opportunityError;

  const [updateAspect, { loading: updating, error: updateError }] = useUpdateAspectMutation({
    onError: handleError,
  });

  const handleUpdate = (aspect: AspectUpdateData) => {
    updateAspect({
      variables: {
        input: {
          ID: aspect.id,
          displayName: aspect.displayName,
          description: aspect.description,
          tags: aspect.tags,
        },
      },
    });
  };

  return <>{children({ aspect }, { loading, error, updating, updateError }, { handleUpdate })}</>;
};
export default AspectSettingsContainer;

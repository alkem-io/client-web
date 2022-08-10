import { FC } from 'react';
import { Scalars, Visual } from '../../../../../../models/graphql-schema';
import {
  ContainerPropsWithProvided,
  renderComponentOrChildrenFn,
} from '../../../../../../utils/containers/ComponentOrChildrenFn';
import {
  useChallengeAspectVisualsQuery,
  useHubAspectVisualsQuery,
  useOpportunityAspectVisualsQuery,
} from '../../../../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../../../../hooks';
import { getAspectCallout } from '../../../../../../containers/aspect/get-aspect-callout';

export interface EntityIds {
  hubNameId: Scalars['UUID_NAMEID'];
  challengeNameId?: Scalars['UUID_NAMEID'];
  opportunityNameId?: Scalars['UUID_NAMEID'];
  aspectNameId?: Scalars['UUID_NAMEID'];
}

interface Provided {
  bannerNarrow: Visual | undefined;
  loading: boolean;
  error: Error | undefined;
}

type AspectCreationDialogVisualStepContainerProps = ContainerPropsWithProvided<EntityIds, Provided>;

const AspectCreationDialogVisualStepContainer: FC<AspectCreationDialogVisualStepContainerProps> = ({
  hubNameId,
  aspectNameId = '',
  challengeNameId = '',
  opportunityNameId = '',
  ...rendered
}) => {
  const handleError = useApolloErrorHandler();

  const isAspectDefined = aspectNameId && hubNameId;

  const {
    data: hubData,
    loading: hubLoading,
    error: hubError,
  } = useHubAspectVisualsQuery({
    variables: { hubNameId, aspectNameId },
    skip: !isAspectDefined || !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubAspect = getAspectCallout(hubData?.hub?.collaboration?.callouts)?.aspects?.[0];

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengeAspectVisualsQuery({
    variables: { hubNameId, challengeNameId, aspectNameId },
    skip: !isAspectDefined || !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeAspect = getAspectCallout(challengeData?.hub?.challenge?.collaboration?.callouts)?.aspects?.[0];

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityAspectVisualsQuery({
    variables: { hubNameId, opportunityNameId, aspectNameId },
    skip: !isAspectDefined || !opportunityNameId,
    onError: handleError,
  });
  const opportunityAspect = getAspectCallout(opportunityData?.hub?.opportunity?.collaboration?.callouts)?.aspects?.[0];

  const aspect = hubAspect ?? challengeAspect ?? opportunityAspect;
  const loading = hubLoading || challengeLoading || opportunityLoading;
  const error = hubError ?? challengeError ?? opportunityError;

  return renderComponentOrChildrenFn(rendered, {
    bannerNarrow: aspect?.bannerNarrow,
    loading,
    error,
  });
};

export default AspectCreationDialogVisualStepContainer;

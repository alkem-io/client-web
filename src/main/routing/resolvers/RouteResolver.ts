import { useUrlParams } from '@/core/routing/useUrlParams';
import {
  useCalloutIdQuery,
  useJourneyRouteResolverQuery,
  useSpaceKeyEntitiesIDsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { takeWhile } from 'lodash';
import { useMemo } from 'react';
import { isApolloNotFoundError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { NotFoundError } from '@/core/notFound/NotFoundErrorBoundary';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

enum RouteType {
  Journey = 'Journey',
}

interface JourneyRouteParams {
  type: RouteType.Journey;
  journeyId: string | undefined;
  parentSpaceId?: string;
  journeyPath: JourneyPath;
  spaceLevel: SpaceLevel; // TODO not sure maybe remove as well, can be calculated from journeyPath
  /**
   * @deprecated
   * use journeyId or journeyPath instead
   */
  spaceId?: string;
  /**
   * @deprecated
   * use journeyId or journeyPath instead
   */
  subSpaceId?: string;
  /**
   * @deprecated
   * use journeyId or journeyPath instead
   */
  subSubSpaceId?: string;

  collaborationId: string | undefined;
  calloutsSetId: string | undefined;
}

interface JourneyCalloutRouteParams extends JourneyRouteParams {
  calloutId: string | undefined;
}

interface RouteResolverState {
  loading: boolean;
  notFound: boolean;
}

type AllParams = JourneyRouteParams & JourneyCalloutRouteParams;

type LazyParams<Params extends {}> = {
  [K in keyof AllParams]: K extends keyof Params ? Params[K] : undefined;
};

type RouteParams = RouteResolverState & (LazyParams<JourneyRouteParams> | LazyParams<JourneyCalloutRouteParams>);

export type JourneyPath = [] | [string] | [string, string] | [string, string, string];

interface JourneyLocation {
  spaceNameId: string | undefined;
  subspaceNameId: string | undefined;
  subsubspaceNameId: string | undefined;
}

const JOURNEY_PARAM_NESTING: (keyof JourneyLocation)[] = ['spaceNameId', 'subspaceNameId', 'subsubspaceNameId'];

const getSpaceLevel = (urlParams: Partial<JourneyLocation>): SpaceLevel => {
  const depth = takeWhile(JOURNEY_PARAM_NESTING, param => urlParams[param]).length - 1;

  if (depth === 0) {
    return SpaceLevel.L0;
  }
  if (depth === 1) {
    return SpaceLevel.L1;
  }
  if (depth === 2) {
    return SpaceLevel.L2;
  }
  // TODO: should be an error, every space has a level.
  return SpaceLevel.L0;
};

const getSpaceDepth = (spaceLevel: SpaceLevel | undefined): number => {
  if (spaceLevel === SpaceLevel.L0) {
    return 0;
  }
  if (spaceLevel === SpaceLevel.L1) {
    return 1;
  }
  if (spaceLevel === SpaceLevel.L2) {
    return 2;
  }
  return -1;
};

interface RouteResolverOptions {
  failOnNotFound?: boolean;
}

export const useRouteResolver = ({ failOnNotFound = true }: RouteResolverOptions = {}): RouteParams => {
  const { spaceNameId, subspaceNameId, subsubspaceNameId, calloutNameId } = useUrlParams();

  const {
    data,
    loading: loadingJourney,
    error: journeyRouteError,
  } = useJourneyRouteResolverQuery({
    variables: {
      spaceNameId: spaceNameId!,
      challengeNameId: subspaceNameId,
      opportunityNameId: subsubspaceNameId,
      includeChallenge: !!subspaceNameId,
      includeOpportunity: !!subsubspaceNameId,
    },
    skip: !spaceNameId,
  });

  const spaceId = data?.space.subspace?.subspace?.id ?? data?.space.subspace?.id ?? data?.space.id;

  const { data: dataSpaceEntities, loading: loadingSpaceEntities } = useSpaceKeyEntitiesIDsQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const collaboration = dataSpaceEntities?.lookup.space?.collaboration;
  const collaborationId = collaboration?.id;
  const calloutsSetId = collaboration?.calloutsSet?.id;

  const spaceLevel = getSpaceLevel({ spaceNameId, subspaceNameId, subsubspaceNameId });
  const journeyLength = getSpaceDepth(spaceLevel) + 1;
  const journeyPath = useMemo(
    () =>
      (data
        ? [data?.space.id, data?.space.subspace?.id, data?.space.subspace?.subspace?.id].slice(0, journeyLength)
        : []) as JourneyPath,
    [data, journeyLength]
  );

  const getParentSpaceId = () => {
    switch (spaceLevel) {
      case SpaceLevel.L1:
        return data?.space.id;
      case SpaceLevel.L2:
        return data?.space.subspace?.id;
      default:
        return undefined;
    }
  };

  const resolvedJourney: JourneyRouteParams = {
    spaceId: data?.space.id,
    subSpaceId: data?.space.subspace?.id,
    subSubSpaceId: data?.space.subspace?.subspace?.id,
    type: RouteType.Journey,
    journeyId: spaceId,
    parentSpaceId: getParentSpaceId(),

    spaceLevel,
    collaborationId,
    calloutsSetId,
    journeyPath,
  };

  const {
    data: calloutData,
    loading: loadingCallout,
    error: calloutIdError,
  } = useCalloutIdQuery({
    variables: {
      calloutNameId: calloutNameId!,
      collaborationId: collaborationId!,
    },
    skip: !calloutNameId || !collaborationId,
  });

  const calloutId = calloutData?.lookup.collaboration?.calloutsSet.callouts?.[0]?.id;

  const loading = loadingJourney || loadingSpaceEntities || loadingCallout;

  const isNotFound = isApolloNotFoundError(journeyRouteError ?? calloutIdError);

  if (failOnNotFound && isNotFound) {
    throw new NotFoundError();
  }

  return {
    loading,
    ...resolvedJourney,
    calloutId,
    notFound: isNotFound,
  };
};

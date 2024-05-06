import { useUrlParams } from '../../../core/routing/useUrlParams';
import { useCalloutIdQuery, useJourneyRouteResolverQuery } from '../../../core/apollo/generated/apollo-hooks';
import { getJourneyTypeName, JourneyTypeName } from '../../../domain/journey/JourneyTypeName';
import { takeWhile } from 'lodash';
import { useMemo } from 'react';

enum RouteType {
  Journey = 'Journey',
}

interface JourneyRouteParams {
  type: RouteType.Journey;
  journeyId: string | undefined;
  parentJourneyId?: string;
  journeyPath: JourneyPath;
  journeyLevel: JourneyLevel | -1; // TODO not sure maybe remove as well, can be calculated from journeyPath
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
  /**
   * @deprecated
   * introduce type JourneyLevel = 0 | 1 | 2 instead
   */
  journeyTypeName: JourneyTypeName;
}

interface JourneyCalloutRouteParams extends JourneyRouteParams {
  calloutId: string | undefined;
}

interface RouteResolverState {
  loading: boolean;
}

type AllParams = JourneyRouteParams & JourneyCalloutRouteParams;

type LazyParams<Params extends {}> = {
  [K in keyof AllParams]: K extends keyof Params ? Params[K] : undefined;
};

type RouteParams = RouteResolverState & (LazyParams<JourneyRouteParams> | LazyParams<JourneyCalloutRouteParams>);

export type JourneyLevel = 0 | 1 | 2;

export type JourneyPath = [] | [string] | [string, string] | [string, string, string];

interface JourneyLocation {
  spaceNameId: string | undefined;
  subspaceNameId: string | undefined;
  subsubspaceNameId: string | undefined;
}

const JOURNEY_PARAM_NESTING: (keyof JourneyLocation)[] = ['spaceNameId', 'subspaceNameId', 'subsubspaceNameId'];

const getJourneyLevel = (urlParams: Partial<JourneyLocation>): JourneyLevel | -1 => {
  return (takeWhile(JOURNEY_PARAM_NESTING, param => urlParams[param]).length - 1) as JourneyLevel | -1;
};

export const useRouteResolver = (): RouteParams => {
  const { spaceNameId, subspaceNameId, subsubspaceNameId, calloutNameId } = useUrlParams();

  const { data, loading: loadingJourney } = useJourneyRouteResolverQuery({
    variables: {
      spaceNameId: spaceNameId!,
      challengeNameId: subspaceNameId,
      opportunityNameId: subsubspaceNameId,
      includeChallenge: !!subspaceNameId,
      includeOpportunity: !!subsubspaceNameId,
    },
    skip: !spaceNameId,
  });

  const journeyLevel = getJourneyLevel({ spaceNameId, subspaceNameId, subsubspaceNameId });
  const journeyLength = journeyLevel + 1;
  const journeyPath = useMemo(
    () =>
      (data
        ? [data?.space.id, data?.space.subspace?.id, data?.space.subspace?.subspace?.id].slice(0, journeyLength)
        : []) as JourneyPath,
    [data, journeyLength]
  );

  const getParentJourneyId = () => {
    switch (journeyLevel) {
      case 1:
        return data?.space.subspace?.id;
      case 2:
        return data?.space.subspace?.subspace?.id;
      default:
        return undefined;
    }
  };

  const resolvedJourney: JourneyRouteParams = {
    spaceId: data?.space.id,
    subSpaceId: data?.space.subspace?.id,
    subSubSpaceId: data?.space.subspace?.subspace?.id,
    type: RouteType.Journey,
    journeyId: data?.space.subspace?.subspace?.id ?? data?.space.subspace?.id ?? data?.space.id,
    parentJourneyId: getParentJourneyId(),
    journeyTypeName: getJourneyTypeName({
      spaceNameId,
      challengeNameId: subspaceNameId,
      opportunityNameId: subsubspaceNameId,
    })!,
    journeyLevel,
    journeyPath,
  };

  const { data: calloutData, loading: loadingCallout } = useCalloutIdQuery({
    variables: {
      calloutNameId: calloutNameId!,
      spaceId: resolvedJourney.subSubSpaceId ?? resolvedJourney.subSpaceId ?? resolvedJourney.spaceId!,
    },
    skip: !resolvedJourney.journeyId || !calloutNameId,
  });

  const collaboration =
    calloutData?.space?.collaboration ?? calloutData?.space?.collaboration ?? calloutData?.space?.collaboration;

  const calloutId = collaboration?.callouts?.[0]?.id;

  const loading = loadingJourney || loadingCallout;

  return {
    loading,
    ...resolvedJourney,
    calloutId,
  };
};

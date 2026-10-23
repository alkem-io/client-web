import type { ApolloError, WatchQueryFetchPolicy } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import { useDeepCompareMemoize } from 'use-deep-compare-effect';
import { useCalloutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import useSpacePermissionsAndEntitlements from '@/domain/space/hooks/useSpacePermissionsAndEntitlements';
import { type LocationStateCachedCallout, LocationStateKeyCachedCallout } from '../../CalloutPage/locationState';
import { useCalloutsSetAuthorization } from '../../calloutsSet/authorization/useCalloutsSetAuthorization';
import type { CalloutDetailsModelExtended } from '../models/CalloutDetailsModel';
import type { CalloutModelExtension } from '../models/CalloutModelLight';

interface useCalloutDetailsProvided {
  callout: CalloutDetailsModelExtended | undefined;
  loading: boolean;
  refetch: () => Promise<unknown>;
  error: ApolloError | undefined;
}

export interface useCalloutDetailsProps {
  calloutId: string | undefined;
  calloutsSetId: string | undefined;
  withClassification: boolean;
  overrideCalloutSettings?: Partial<CalloutModelExtension<{}>>;
  skip?: boolean;
  /**
   * Defaults to Apollo's `cache-first`. Surfaces that open a single callout pass
   * `cache-and-network` so a callout already cached earlier in the session is
   * revalidated on open instead of being served as-is.
   */
  fetchPolicy?: WatchQueryFetchPolicy;
}

const useCalloutDetails = ({
  calloutId,
  calloutsSetId,
  withClassification,
  overrideCalloutSettings,
  skip,
  fetchPolicy,
}: useCalloutDetailsProps): useCalloutDetailsProvided => {
  const { entitlements, permissions } = useSpacePermissionsAndEntitlements();
  const locationState = (useLocation().state ?? {}) as LocationStateCachedCallout;

  const canBeSavedAsTemplate = permissions.canSaveAsTemplate && entitlements.entitledToSaveAsTemplate;
  const { canMoveCallouts } = useCalloutsSetAuthorization({ calloutsSetId });

  const { data, loading, refetch, error } = useCalloutDetailsQuery({
    variables: {
      calloutId: calloutId!,
      withClassification,
    },
    skip: skip || !calloutId,
    fetchPolicy,
  });

  // Use deep comparison for overrideCalloutSettings to avoid unnecessary rerenders
  const memoizedOverrideCalloutSettings = useDeepCompareMemoize(overrideCalloutSettings);

  const result: CalloutDetailsModelExtended | undefined = (() => {
    const calloutDetails = data?.lookup.callout;

    // Only use cached data if we don't have fresh data yet
    if (!calloutDetails && locationState[LocationStateKeyCachedCallout]) {
      return locationState[LocationStateKeyCachedCallout];
    }

    if (!calloutDetails) {
      return;
    }

    return {
      ...calloutDetails,
      calloutsSetId,
      draft: calloutDetails.settings.visibility === CalloutVisibility.Draft,
      editable: calloutDetails.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false,
      movable: canMoveCallouts,
      // Every framing is templatable, Poll and Form included: a template captures only their
      // definition, never votes or responses.
      canBeSavedAsTemplate,
      classificationTagsets: [],
      publishedDate: calloutDetails.publishedDate ? new Date(calloutDetails.publishedDate) : undefined,
      createdDate: calloutDetails.createdDate ? new Date(calloutDetails.createdDate) : undefined,
      ...memoizedOverrideCalloutSettings,
    };
  })();

  return {
    callout: result,
    loading,
    refetch,
    error,
  };
};

export default useCalloutDetails;

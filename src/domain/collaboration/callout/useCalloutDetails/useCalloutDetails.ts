import { useMemo } from 'react';
import { useCalloutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import { ApolloError } from '@apollo/client';
import { CalloutDetailsModelExtended } from '../models/CalloutDetailsModel';
import useSpacePermissionsAndEntitlements from '@/domain/space/hooks/useSpacePermissionsAndEntitlements';
import { useLocation } from 'react-router-dom';
import { LocationStateCachedCallout, LocationStateKeyCachedCallout } from '../../CalloutPage/CalloutPage';
import { CalloutModelExtension } from '../models/CalloutModelLight';
import { useCalloutsSetAuthorization } from '../../calloutsSet/authorization/useCalloutsSetAuthorization';

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
}

const useCalloutDetails = ({
  calloutId,
  calloutsSetId,
  withClassification,
  overrideCalloutSettings,
  skip,
}: useCalloutDetailsProps): useCalloutDetailsProvided => {
  const { entitlements, permissions } = useSpacePermissionsAndEntitlements();
  const locationState = (useLocation().state ?? {}) as LocationStateCachedCallout;

  const calloutsCanBeSavedAsTemplate = entitlements?.entitledToSaveAsTemplate && permissions.canCreateTemplates;
  const { canMoveCallouts } = useCalloutsSetAuthorization({ calloutsSetId });

  const { data, loading, refetch, error } = useCalloutDetailsQuery({
    variables: {
      calloutId: calloutId!,
      withClassification,
    },
    skip: skip || !calloutId,
  });

  const result: CalloutDetailsModelExtended | undefined = useMemo(() => {
    if (locationState[LocationStateKeyCachedCallout]) {
      return locationState[LocationStateKeyCachedCallout];
    }

    const calloutDetails = data?.lookup.callout;

    if (!calloutDetails) {
      return;
    }

    return {
      ...calloutDetails,
      calloutsSetId: calloutsSetId,
      draft: calloutDetails.settings.visibility === CalloutVisibility.Draft,
      editable: calloutDetails.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false,
      movable: canMoveCallouts,
      canBeSavedAsTemplate: calloutsCanBeSavedAsTemplate,
      classificationTagsets: [],
      ...overrideCalloutSettings,
    };
  }, [data, loading]);

  return {
    callout: result,
    loading,
    refetch,
    error,
  };
};

export default useCalloutDetails;

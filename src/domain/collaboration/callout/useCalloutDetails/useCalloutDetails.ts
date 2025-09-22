import { useMemo } from 'react';
import { useCalloutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import { ApolloError } from '@apollo/client';
import { CalloutDetailsModelExtended } from '../models/CalloutDetailsModel';
import useSpacePermissionsAndEntitlements from '@/domain/space/hooks/useSpacePermissionsAndEntitlements';
import { useLocation } from 'react-router-dom';
import { LocationStateCachedCallout, LocationStateKeyCachedCallout } from '../../CalloutPage/CalloutPage';

export interface useCalloutDetailsProvided {
  callout: CalloutDetailsModelExtended | undefined;
  loading: boolean;
  refetch: () => Promise<unknown>;
  error: ApolloError | undefined;
}

export interface useCalloutDetailsProps {
  calloutId: string | undefined;
  withClassification: boolean; //!!
  withContributions?: boolean; //!!
  skip?: boolean;
}

const useCalloutDetails = ({
  calloutId,
  withClassification,
  skip,
}: useCalloutDetailsProps): useCalloutDetailsProvided => {
  const { entitlements, permissions } = useSpacePermissionsAndEntitlements();
  const locationState = (useLocation().state ?? {}) as LocationStateCachedCallout;

  const calloutsCanBeSavedAsTemplate = entitlements?.entitledToSaveAsTemplate && permissions.canCreateTemplates;

  const { data, loading, refetch, error } = useCalloutDetailsQuery({
    variables: {
      calloutId: calloutId!,
      withClassification, //!! callout.classificationTagsets.length > 0,
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
      comments: calloutDetails.comments,
      // Fake callout properties to show the callout inside the dialog without any controls
      draft: calloutDetails.settings.visibility === CalloutVisibility.Draft,
      editable: calloutDetails.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false,
      movable: false,
      canBeSavedAsTemplate: calloutsCanBeSavedAsTemplate,
      flowStates: undefined,
      authorization: {
        myPrivileges: [],
      },
      classificationTagsets: [],
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

import React, { FC, useContext } from 'react';
import { useApolloErrorHandler, useUrlParams } from '../../../hooks';
import {
  useChallengeAspectProviderQuery,
  useHubAspectProviderQuery,
  useOpportunityAspectProviderQuery,
} from '../../../hooks/generated/graphql';
import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege } from '../../../models/graphql-schema';
import { getCardCallout } from '../../../containers/aspect/getAspectCallout';

interface AspectPermissions {
  canUpdate: boolean;
}

interface AspectContextProps {
  id?: string;
  nameId?: string;
  displayName?: string;
  permissions: AspectPermissions;
  loading: boolean;
  error?: ApolloError;
}

const AspectContext = React.createContext<AspectContextProps>({
  loading: false,
  permissions: {
    canUpdate: true,
  },
});

const AspectProvider: FC = ({ children }) => {
  const {
    hubNameId = '',
    challengeNameId = '',
    opportunityNameId = '',
    aspectNameId = '',
    calloutNameId = '',
  } = useUrlParams();

  const handleError = useApolloErrorHandler();
  const isAspectDefined = aspectNameId && hubNameId;

  const {
    data: hubData,
    loading: hubLoading,
    error: hubError,
  } = useHubAspectProviderQuery({
    variables: { hubNameId, aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubAspect = getCardCallout(hubData?.hub?.collaboration?.callouts, aspectNameId)?.aspects?.find(
    x => x.nameID === aspectNameId
  );
  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengeAspectProviderQuery({
    variables: { hubNameId, challengeNameId, aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeAspect = getCardCallout(
    challengeData?.hub?.challenge?.collaboration?.callouts,
    aspectNameId
  )?.aspects?.find(x => x.nameID === aspectNameId);

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityAspectProviderQuery({
    variables: { hubNameId, opportunityNameId, aspectNameId, calloutNameId },
    skip: !calloutNameId || !isAspectDefined || !opportunityNameId,
    onError: handleError,
  });
  const opportunityAspect = getCardCallout(
    opportunityData?.hub?.opportunity?.collaboration?.callouts,
    aspectNameId
  )?.aspects?.find(x => x.nameID === aspectNameId);

  const aspect = hubAspect ?? challengeAspect ?? opportunityAspect;
  const loading = hubLoading || challengeLoading || opportunityLoading;
  const error = hubError ?? challengeError ?? opportunityError;

  const myPrivileges = aspect?.authorization?.myPrivileges;
  const permissions: AspectPermissions = {
    canUpdate: myPrivileges?.includes(AuthorizationPrivilege.Update) ?? true,
  };

  return (
    <AspectContext.Provider
      value={{
        loading,
        error,
        id: aspect?.id,
        nameId: aspect?.nameID,
        displayName: aspect?.displayName,
        permissions,
      }}
    >
      {children}
    </AspectContext.Provider>
  );
};
export default AspectProvider;

export const useAspect = () => useContext(AspectContext);

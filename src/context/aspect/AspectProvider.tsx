import React, { FC, useContext, useMemo } from 'react';
import { useApolloErrorHandler, useUrlParams } from '../../hooks';
import {
  useChallengeAspectProviderQuery,
  useHubAspectProviderQuery,
  useOpportunityAspectProviderQuery,
} from '../../hooks/generated/graphql';
import { ApolloError } from '@apollo/client';
import { AuthorizationPrivilege } from '../../models/graphql-schema';

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
    ecoverseNameId: hubNameId = '',
    challengeNameId = '',
    opportunityNameId = '',
    aspectNameId = '',
  } = useUrlParams();

  const handleError = useApolloErrorHandler();
  const isAspectDefined = aspectNameId && hubNameId;

  const {
    data: hubData,
    loading: hubLoading,
    error: hubError,
  } = useHubAspectProviderQuery({
    variables: { hubNameId, aspectNameId },
    skip: !isAspectDefined || !!(challengeNameId || opportunityNameId),
    onError: handleError,
  });
  const hubAspect = hubData?.ecoverse?.context?.aspects?.[0];

  const {
    data: challengeData,
    loading: challengeLoading,
    error: challengeError,
  } = useChallengeAspectProviderQuery({
    variables: { hubNameId, challengeNameId, aspectNameId },
    skip: !isAspectDefined || !challengeNameId || !!opportunityNameId,
    onError: handleError,
  });
  const challengeAspect = challengeData?.ecoverse?.challenge?.context?.aspects?.[0];

  const {
    data: opportunityData,
    loading: opportunityLoading,
    error: opportunityError,
  } = useOpportunityAspectProviderQuery({
    variables: { hubNameId, opportunityNameId, aspectNameId },
    skip: !isAspectDefined || !opportunityNameId,
    onError: handleError,
  });
  const opportunityAspect = opportunityData?.ecoverse?.opportunity?.context?.aspects?.[0];

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

export const useAspect = () => {
  const context = useContext(AspectContext);
  return useMemo(() => ({ ...context }), [context]);
};

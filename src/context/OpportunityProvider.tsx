import React, { FC, useMemo } from 'react';
import { useOpportunityInfoQuery } from '../hooks/generated/graphql';
import { AuthorizationPrivilege, OpportunityInfoFragment } from '../models/graphql-schema';
import { useChallenge } from '../hooks';
import { useUrlParams } from '../hooks';

interface OpportunityViewerPermissions {
  viewerCanUpdate: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

interface OpportunityContextProps {
  opportunity?: OpportunityInfoFragment;
  opportunityId: string;
  opportunityNameId: string;
  challengeId: string;
  challengeNameId: string;
  ecoverseId: string;
  ecoverseNameId: string;
  displayName: string;
  loading: boolean;
  permissions: OpportunityViewerPermissions;
}

const OpportunityContext = React.createContext<OpportunityContextProps>({
  loading: true,
  opportunityId: '',
  opportunityNameId: '',
  challengeId: '',
  challengeNameId: '',
  ecoverseId: '',
  ecoverseNameId: '',
  displayName: '',
  permissions: {
    viewerCanUpdate: false,
    contextPrivileges: [],
  },
});

interface OpportunityProviderProps {}

const OpportunityProvider: FC<OpportunityProviderProps> = ({ children }) => {
  const { ecoverseNameId = '', challengeNameId = '', opportunityNameId = '' } = useUrlParams();
  const { data, loading } = useOpportunityInfoQuery({
    variables: { ecoverseId: ecoverseNameId, opportunityId: opportunityNameId },
    errorPolicy: 'all',
  });
  const ecoverseId = data?.ecoverse?.id || '';
  const opportunity = data?.ecoverse?.opportunity;
  const opportunityId = opportunity?.id || '';
  // using the challenge provider
  const { challengeId } = useChallenge();
  const displayName = opportunity?.displayName || '';

  const permissions = useMemo<OpportunityViewerPermissions>(
    () => ({
      viewerCanUpdate: opportunity?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) || false,
      contextPrivileges: opportunity?.context?.authorization?.myPrivileges ?? [],
    }),
    [opportunity]
  );

  return (
    <OpportunityContext.Provider
      value={{
        opportunity,
        ecoverseId,
        ecoverseNameId,
        challengeId,
        challengeNameId,
        opportunityId,
        opportunityNameId,
        displayName,
        permissions,
        loading,
      }}
    >
      {children}
    </OpportunityContext.Provider>
  );
};

export { OpportunityProvider, OpportunityContext };

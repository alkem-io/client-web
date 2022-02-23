import React, { FC, useMemo } from 'react';
import { useOpportunityInfoQuery } from '../hooks/generated/graphql';
import { AuthorizationPrivilege, OpportunityInfoFragment } from '../models/graphql-schema';
import { useChallenge } from '../hooks';
import { useUrlParams } from '../hooks';

interface OpportunityViewerPermissions {
  viewerCanUpdate: boolean;
  communityReadAccess: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

interface OpportunityContextProps {
  opportunity?: OpportunityInfoFragment;
  opportunityId: string;
  opportunityNameId: string;
  challengeId: string;
  challengeNameId: string;
  hubId: string;
  hubNameId: string;
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
  hubId: '',
  hubNameId: '',
  displayName: '',
  permissions: {
    viewerCanUpdate: false,
    communityReadAccess: false,
    contextPrivileges: [],
  },
});

interface OpportunityProviderProps {}

const OpportunityProvider: FC<OpportunityProviderProps> = ({ children }) => {
  const { hubNameId = '', challengeNameId = '', opportunityNameId = '' } = useUrlParams();
  const { data, loading } = useOpportunityInfoQuery({
    variables: { hubId: hubNameId, opportunityId: opportunityNameId },
    errorPolicy: 'all',
  });
  const hubId = data?.hub?.id || '';
  const opportunity = data?.hub?.opportunity;
  const opportunityId = opportunity?.id || '';
  // using the challenge provider
  const { challengeId } = useChallenge();
  const displayName = opportunity?.displayName || '';

  const permissions = useMemo<OpportunityViewerPermissions>(
    () => ({
      viewerCanUpdate: opportunity?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) || false,
      contextPrivileges: opportunity?.context?.authorization?.myPrivileges ?? [],
      communityReadAccess: (opportunity?.community?.authorization?.myPrivileges ?? []).some(
        x => x === AuthorizationPrivilege.Read
      ),
    }),
    [opportunity]
  );

  return (
    <OpportunityContext.Provider
      value={{
        opportunity,
        hubId,
        hubNameId,
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

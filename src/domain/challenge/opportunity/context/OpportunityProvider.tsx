import React, { FC, useMemo } from 'react';
import { useOpportunityProviderQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, OpportunityProviderFragment } from '../../../../core/apollo/generated/graphql-schema';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { useChallenge } from '../../challenge/hooks/useChallenge';

interface OpportunityViewerPermissions {
  viewerCanUpdate: boolean;
  communityReadAccess: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

export interface OpportunityContextProps {
  opportunity?: OpportunityProviderFragment;
  opportunityId: string;
  opportunityNameId: string;
  communityId: string;
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
  communityId: '',
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
  const { data, loading } = useOpportunityProviderQuery({
    variables: { hubId: hubNameId, opportunityId: opportunityNameId },
    errorPolicy: 'all',
  });
  const hubId = data?.hub?.id || '';
  const opportunity = data?.hub?.opportunity;
  const opportunityId = opportunity?.id || '';
  const communityId = opportunity?.community?.id ?? '';
  // using the challenge provider
  const { challengeId } = useChallenge();
  const displayName = opportunity?.displayName || '';

  const permissions = useMemo<OpportunityViewerPermissions>(
    () => ({
      viewerCanUpdate: opportunity?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) || false,
      contextPrivileges: opportunity?.context?.authorization?.myPrivileges ?? [],
      communityReadAccess: (opportunity?.community?.authorization?.myPrivileges ?? []).includes(
        AuthorizationPrivilege.Read
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
        communityId,
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

import React, { FC, useMemo } from 'react';
import { useOpportunityProviderQuery } from '../../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  OpportunityProviderFragment,
} from '../../../../core/apollo/generated/graphql-schema';
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
  spaceId: string;
  spaceNameId: string;
  loading: boolean;
  permissions: OpportunityViewerPermissions;
  displayName: string;
  myMembershipStatus: CommunityMembershipStatus | undefined;
}

const OpportunityContext = React.createContext<OpportunityContextProps>({
  loading: true,
  opportunityId: '',
  opportunityNameId: '',
  communityId: '',
  challengeId: '',
  challengeNameId: '',
  spaceId: '',
  spaceNameId: '',
  permissions: {
    viewerCanUpdate: false,
    communityReadAccess: false,
    contextPrivileges: [],
  },
  displayName: '',
  myMembershipStatus: undefined,
});

interface OpportunityProviderProps {}

const OpportunityProvider: FC<OpportunityProviderProps> = ({ children }) => {
  const { spaceNameId = '', challengeNameId = '', opportunityNameId = '' } = useUrlParams();
  const { data, loading } = useOpportunityProviderQuery({
    variables: { spaceId: spaceNameId, opportunityId: opportunityNameId },
    errorPolicy: 'all',
  });
  const spaceId = data?.space?.id || '';
  const opportunity = data?.space?.opportunity;
  const opportunityId = opportunity?.id || '';
  const communityId = opportunity?.community?.id ?? '';
  // using the challenge provider
  const { challengeId } = useChallenge();
  const displayName = opportunity?.profile.displayName || '';

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
        displayName,
        spaceId,
        spaceNameId,
        challengeId,
        challengeNameId,
        opportunityId,
        opportunityNameId,
        communityId,
        permissions,
        loading,
        myMembershipStatus: opportunity?.community?.myMembershipStatus,
      }}
    >
      {children}
    </OpportunityContext.Provider>
  );
};

export { OpportunityProvider, OpportunityContext };

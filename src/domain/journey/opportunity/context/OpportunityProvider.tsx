import React, { FC, useMemo } from 'react';
import { useOpportunityProviderQuery } from '../../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  OpportunityProviderFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

interface OpportunityViewerPermissions {
  viewerCanUpdate: boolean;
  communityReadAccess: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

export interface OpportunityContextProps {
  opportunity?: OpportunityProviderFragment;
  opportunityId: string;
  communityId: string;
  loading: boolean;
  permissions: OpportunityViewerPermissions;
  myMembershipStatus: CommunityMembershipStatus | undefined;
  profile: OpportunityProviderFragment['profile'];
}

const DEFAULT_CONTEXT = {
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
  myMembershipStatus: undefined,
  profile: {
    id: '',
    displayName: '',
    visuals: [],
    tagline: '',
    url: '',
  },
};

const OpportunityContext = React.createContext<OpportunityContextProps>(DEFAULT_CONTEXT);

interface OpportunityProviderProps {}

const OpportunityProvider: FC<OpportunityProviderProps> = ({ children }) => {
  const { subSubSpaceId: opportunityId } = useRouteResolver();

  const { data, loading } = useOpportunityProviderQuery({
    variables: { opportunityId: opportunityId! },
    skip: !opportunityId,
    errorPolicy: 'all',
  });

  const opportunity = data?.lookup.subsubspace;

  const communityId = opportunity?.community?.id ?? '';

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
        opportunityId: opportunityId ?? '',
        communityId,
        permissions,
        loading,
        profile: opportunity?.profile ?? DEFAULT_CONTEXT.profile,
        myMembershipStatus: opportunity?.community?.myMembershipStatus,
      }}
    >
      {children}
    </OpportunityContext.Provider>
  );
};

export { OpportunityProvider, OpportunityContext };

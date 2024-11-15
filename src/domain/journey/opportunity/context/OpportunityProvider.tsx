import React, { FC, useMemo } from 'react';
import { useSubspaceProviderQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  SubspaceProviderFragment,
} from '@/core/apollo/generated/graphql-schema';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

interface OpportunityViewerPermissions {
  viewerCanUpdate: boolean;
  communityReadAccess: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

export interface OpportunityContextProps {
  opportunity?: SubspaceProviderFragment;
  opportunityId: string;
  communityId: string;
  roleSetId: string;
  loading: boolean;
  permissions: OpportunityViewerPermissions;
  myMembershipStatus: CommunityMembershipStatus | undefined;
  profile: SubspaceProviderFragment['profile'];
}

const DEFAULT_CONTEXT = {
  loading: true,
  opportunityId: '',
  opportunityNameId: '',
  communityId: '',
  roleSetId: '',
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

/**
 * @deprecated
 */
const OpportunityContext = React.createContext<OpportunityContextProps>(DEFAULT_CONTEXT);

interface OpportunityProviderProps {}

/**
 * @deprecated
 */
const OpportunityProvider: FC<OpportunityProviderProps> = ({ children }) => {
  const { subSubSpaceId: opportunityId } = useRouteResolver();

  const { data, loading } = useSubspaceProviderQuery({
    variables: { subspaceId: opportunityId! },
    skip: !opportunityId,
    errorPolicy: 'all',
  });

  const opportunity = data?.lookup.space;

  const communityId = opportunity?.community?.id ?? '';
  const roleSetId = opportunity?.community?.roleSet?.id ?? '';

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
        roleSetId,
        permissions,
        loading,
        profile: opportunity?.profile ?? DEFAULT_CONTEXT.profile,
        myMembershipStatus: opportunity?.community?.roleSet?.myMembershipStatus,
      }}
    >
      {children}
    </OpportunityContext.Provider>
  );
};

export { OpportunityProvider, OpportunityContext };

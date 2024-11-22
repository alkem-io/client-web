import React, { useContext } from 'react';
import { AuthorizationPrivilege, CommunityMembershipStatus } from '@/core/apollo/generated/graphql-schema';

export interface CommunityContextValue {
  communityId: string;
  roleSetId: string;
  communicationId: string;
  communityName: string;
  communicationPrivileges: AuthorizationPrivilege[];
  loading: boolean;
  myMembershipStatus: CommunityMembershipStatus | undefined;
}

const CommunityContext = React.createContext<CommunityContextValue>({
  loading: false,
  communityId: '',
  roleSetId: '',
  communicationId: '',
  communityName: '',
  communicationPrivileges: [],
  myMembershipStatus: undefined,
});

const useCommunityContext = () => useContext(CommunityContext);

export { CommunityContext, useCommunityContext };

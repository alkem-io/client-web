import React, { useContext } from 'react';
import { AuthorizationPrivilege } from '../../../models/graphql-schema';

export interface CommunityContextValue {
  communityId: string;
  communicationId: string;
  communityName: string;
  communicationPrivileges: AuthorizationPrivilege[];
  loading: boolean;
}

const CommunityContext = React.createContext<CommunityContextValue>({
  loading: false,
  communityId: '',
  communicationId: '',
  communityName: '',
  communicationPrivileges: [],
});

const useCommunityContext = () => useContext(CommunityContext);

export { CommunityContext, useCommunityContext };

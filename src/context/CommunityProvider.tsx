import React, { FC, useContext, useMemo } from 'react';
import { useUrlParams } from '../hooks';
import {
  useChallengeCommunityQuery,
  useEcoverseCommunityQuery,
  useOpportunityCommunityQuery,
} from '../hooks/generated/graphql';
import { AuthorizationPrivilege } from '../models/graphql-schema';

interface CommunityContextProps {
  communityId: string;
  communicationId: string;
  communityName: string;
  communicationPrivileges: AuthorizationPrivilege[];
  loading: boolean;
}

const CommunityContext = React.createContext<CommunityContextProps>({
  loading: false,
  communityId: '',
  communicationId: '',
  communityName: '',
  communicationPrivileges: [],
});

interface CommunityProviderProps {}

const CommunityProvider: FC<CommunityProviderProps> = ({ children }) => {
  const { hubNameId = '', challengeNameId = '', opportunityNameId = '' } = useUrlParams();

  const { data: hubData, loading: loadingEcoverse } = useEcoverseCommunityQuery({
    variables: { hubId: hubNameId },
    errorPolicy: 'all',
    skip: !hubNameId || Boolean(challengeNameId) || Boolean(opportunityNameId),
  });

  const { data: challengeData, loading: loadingChallenge } = useChallengeCommunityQuery({
    variables: { hubId: hubNameId, challengeId: challengeNameId },
    errorPolicy: 'all',
    skip: !hubNameId || !challengeNameId || Boolean(opportunityNameId),
  });

  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityCommunityQuery({
    variables: { hubId: hubNameId, opportunityId: opportunityNameId },
    errorPolicy: 'all',
    skip: !hubNameId || !opportunityNameId,
  });

  const community = useMemo(() => {
    return (
      hubData?.hub.community || challengeData?.hub.challenge.community || opportunityData?.hub.opportunity.community
    );
  }, [hubData, challengeData, opportunityData]);

  return (
    <CommunityContext.Provider
      value={{
        communityId: community?.id || '',
        communityName: community?.displayName || '',
        communicationId: community?.communication?.id || '',
        communicationPrivileges: community?.communication?.authorization?.myPrivileges || [],
        loading: loadingEcoverse || loadingChallenge || loadingOpportunity,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

const useCommunityContext = () => {
  return useContext(CommunityContext);
};

export { CommunityProvider, CommunityContext, useCommunityContext };

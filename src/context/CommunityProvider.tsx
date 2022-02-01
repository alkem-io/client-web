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
  const { ecoverseNameId = '', challengeNameId = '', opportunityNameId = '' } = useUrlParams();

  const { data: ecoverseData, loading: loadingEcoverse } = useEcoverseCommunityQuery({
    variables: { ecoverseId: ecoverseNameId },
    errorPolicy: 'all',
    skip: !ecoverseNameId || Boolean(challengeNameId) || Boolean(opportunityNameId),
  });

  const { data: challengeData, loading: loadingChallenge } = useChallengeCommunityQuery({
    variables: { ecoverseId: ecoverseNameId, challengeId: challengeNameId },
    errorPolicy: 'all',
    skip: !ecoverseNameId || !challengeNameId || Boolean(opportunityNameId),
  });

  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityCommunityQuery({
    variables: { ecoverseId: ecoverseNameId, opportunityId: opportunityNameId },
    errorPolicy: 'all',
    skip: !ecoverseNameId || !opportunityNameId,
  });

  const community = useMemo(() => {
    return (
      ecoverseData?.ecoverse.community ||
      challengeData?.ecoverse.challenge.community ||
      opportunityData?.ecoverse.opportunity.community
    );
  }, [ecoverseData, challengeData, opportunityData]);

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

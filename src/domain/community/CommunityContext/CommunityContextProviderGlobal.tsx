import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../../hooks';
import {
  useChallengeCommunityQuery,
  useHubCommunityQuery,
  useOpportunityCommunityQuery,
} from '../../../hooks/generated/graphql';
import { CommunityContext, CommunityContextValue } from './CommunityContext';

/**
 * @deprecated
 * The idea is to get rid of ContextProviders that sit too high in the tree and fetch data globally for some random consumers.
 * Instead, just fetch the data locally when needed.
 * @param children
 * @constructor
 */
const CommunityContextProviderGlobal: FC = ({ children }) => {
  const { hubNameId = '', challengeNameId = '', opportunityNameId = '' } = useUrlParams();

  const { data: hubData, loading: loadingHub } = useHubCommunityQuery({
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

  const community =
    hubData?.hub.community || challengeData?.hub.challenge.community || opportunityData?.hub.opportunity.community;
  const isLoading = loadingHub || loadingChallenge || loadingOpportunity;

  const providedValue = useMemo<CommunityContextValue>(
    () => ({
      communityId: community?.id || '',
      communityName: community?.displayName || '',
      communicationId: community?.communication?.id || '',
      communicationPrivileges: community?.communication?.authorization?.myPrivileges || [],
      loading: isLoading,
    }),
    [community, isLoading]
  );

  return <CommunityContext.Provider value={providedValue}>{children}</CommunityContext.Provider>;
};

export default CommunityContextProviderGlobal;

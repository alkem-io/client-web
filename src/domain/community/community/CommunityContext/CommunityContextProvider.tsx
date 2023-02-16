import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  useChallengeCommunityQuery,
  useHubCommunityQuery,
  useOpportunityCommunityQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { CommunityContext, CommunityContextValue } from './CommunityContext';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import { useChallenge } from '../../../challenge/challenge/hooks/useChallenge';
import { useOpportunity } from '../../../challenge/opportunity/hooks/useOpportunity';

/**
 * @deprecated
 * The idea is to get rid of ContextProviders that sit too high in the tree and fetch data globally for some random consumers.
 * Instead, just fetch the data locally when needed.
 * @param children
 * @constructor
 */
const CommunityContextProvider: FC = ({ children }) => {
  const { hubNameId = '', challengeNameId = '', opportunityNameId = '' } = useUrlParams();

  const { permissions: hubPermissions } = useHub();
  const { permissions: challengePermissions } = useChallenge();
  const { permissions: opportunityPermissions } = useOpportunity();

  const { data: hubData, loading: loadingHub } = useHubCommunityQuery({
    variables: { hubId: hubNameId, includeDetails: hubPermissions.communityReadAccess },
    errorPolicy: 'all',
    skip: !hubNameId || Boolean(challengeNameId) || Boolean(opportunityNameId),
  });

  const { data: challengeData, loading: loadingChallenge } = useChallengeCommunityQuery({
    variables: {
      hubId: hubNameId,
      challengeId: challengeNameId,
      includeDetails: challengePermissions.canReadCommunity,
    },
    errorPolicy: 'all',
    skip: !hubNameId || !challengeNameId || Boolean(opportunityNameId),
  });

  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityCommunityQuery({
    variables: {
      hubId: hubNameId,
      opportunityId: opportunityNameId,
      includeDetails: opportunityPermissions.communityReadAccess,
    },
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

export default CommunityContextProvider;

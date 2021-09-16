import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import CommunityPage from './CommunityPage';
import { useOpportunity, useUserContext } from '../../hooks';
import { buildAdminOpportunityUrl } from '../../utils/urlBuilders';
import { AuthorizationCredential } from '../../models/graphql-schema';

const OpportunityCommunityPage: FC<PageProps> = ({ paths }) => {
  const { user: userMetadata } = useUserContext();

  const { opportunity, challengeId, ecoverseId } = useOpportunity();

  const opportunityId = opportunity?.id || '';
  const opportunityNameId = opportunity?.nameID || '';
  const communityId = opportunity?.community?.id;
  const displayName = opportunity?.displayName;
  const tagline = opportunity?.context?.tagline;

  const settingsUrl = opportunityNameId
    ? buildAdminOpportunityUrl(ecoverseId, challengeId, opportunityNameId)
    : undefined;

  const isAdmin = useMemo(
    () =>
      userMetadata?.hasCredentials(AuthorizationCredential.GlobalAdmin) ||
      userMetadata?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity) ||
      userMetadata?.isEcoverseAdmin(ecoverseId) ||
      userMetadata?.isChallengeAdmin(challengeId) ||
      false,
    [userMetadata, opportunityId, ecoverseId]
  );

  return (
    <CommunityPage
      communityId={communityId}
      parentDisplayName={displayName}
      parentTagline={tagline}
      permissions={{ edit: isAdmin }}
      settingsUrl={settingsUrl}
      paths={paths}
    />
  );
};
export default OpportunityCommunityPage;

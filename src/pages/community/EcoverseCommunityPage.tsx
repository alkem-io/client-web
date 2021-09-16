import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import CommunityPage from './CommunityPage';
import { useEcoverse, useUserContext } from '../../hooks';
import { buildAdminEcoverseUrl } from '../../utils/urlBuilders';
import { AuthorizationCredential } from '../../models/graphql-schema';

const EcoverseCommunityPage: FC<PageProps> = ({ paths }) => {
  const { user: userMetadata } = useUserContext();

  const { ecoverse: _ecoverse } = useEcoverse();
  const ecoverse = _ecoverse?.ecoverse;

  const ecoverseId = ecoverse?.id || '';
  const ecoverseNameId = ecoverse?.nameID;
  const communityId = ecoverse?.community?.id;
  const displayName = ecoverse?.displayName;
  const tagline = ecoverse?.context?.tagline;

  const settingsUrl = ecoverseNameId ? buildAdminEcoverseUrl(ecoverseNameId) : undefined;

  const isAdmin = useMemo(
    () =>
      userMetadata?.hasCredentials(AuthorizationCredential.GlobalAdmin) ||
      userMetadata?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity) ||
      userMetadata?.isEcoverseAdmin(ecoverseId) ||
      false,
    [userMetadata, ecoverseId]
  );

  const membershipTitle = 'Ecoverse host';
  const ecoverseHostId = ecoverse?.host?.id;

  return (
    <CommunityPage
      communityId={communityId}
      parentDisplayName={displayName}
      parentTagline={tagline}
      membershipTitle={membershipTitle}
      ecoverseHostId={ecoverseHostId}
      permissions={{ edit: isAdmin }}
      settingsUrl={settingsUrl}
      paths={paths}
    />
  );
};
export default EcoverseCommunityPage;

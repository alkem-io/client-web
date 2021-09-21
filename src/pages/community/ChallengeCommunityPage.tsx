import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageProps } from '../common';
import CommunityPage from './CommunityPage';
import { useChallenge, useUserContext } from '../../hooks';
import { buildAdminChallengeUrl } from '../../utils/urlBuilders';
import { AuthorizationCredential, OrganizationDetailsFragment } from '../../models/graphql-schema';
import { useChallengeLeadOrganizationsQuery } from '../../hooks/generated/graphql';

const ChallengeCommunityPage: FC<PageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { user: userMetadata } = useUserContext();

  const { challenge, ecoverseId } = useChallenge();

  const challengeId = challenge?.id || '';
  const challengeNameId = challenge?.nameID || '';
  const communityId = challenge?.community?.id;
  const displayName = challenge?.displayName;
  const tagline = challenge?.context?.tagline;

  const settingsUrl = challengeNameId ? buildAdminChallengeUrl(ecoverseId, challengeNameId) : undefined;

  const isAdmin = useMemo(
    () =>
      userMetadata?.hasCredentials(AuthorizationCredential.GlobalAdmin) ||
      userMetadata?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity) ||
      userMetadata?.isEcoverseAdmin(ecoverseId) ||
      userMetadata?.isChallengeAdmin(challengeId) ||
      false,
    [userMetadata, challengeId, ecoverseId]
  );

  const membershipTitle = t('pages.community.leading-organizations');
  const { data: _leadingOrganisations } = useChallengeLeadOrganizationsQuery({
    variables: { ecoverseId: ecoverseId, challengeID: challengeNameId },
    skip: !challengeNameId,
  });
  const leadingOrganizations = (_leadingOrganisations?.ecoverse.challenge.leadOrganizations ||
    []) as OrganizationDetailsFragment[];

  return (
    <CommunityPage
      communityId={communityId}
      parentDisplayName={displayName}
      parentTagline={tagline}
      membershipTitle={membershipTitle}
      leadingOrganizations={leadingOrganizations}
      permissions={{ edit: isAdmin }}
      settingsUrl={settingsUrl}
      paths={paths}
    />
  );
};
export default ChallengeCommunityPage;

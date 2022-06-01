import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useHub, useUserContext } from '../../hooks';
import CommunityPage from './CommunityPage';
import { toOrganizationCardProps } from '../../domain/community/utils/useOrganizationCardProps';
import { useHubCommunityContributorsQuery } from '../../hooks/generated/graphql';
import { useTranslation } from 'react-i18next';
import HostOrganization from '../../domain/community/CommunityContributors/HostOrganization';
import CommunityContributorsSection from '../../domain/community/CommunityContributors/CommunityContributorsSection';
import useCommunityContributors from '../../domain/community/CommunityContributors/useCommunityContributors';

const HubCommunityPage: FC<PageProps> = ({ paths }) => {
  const { hubId, communityId } = useHub();

  const {
    contributors: { host, ...contributors },
    loading,
  } = useCommunityContributors(
    useHubCommunityContributorsQuery,
    data => {
      const { leadUsers, memberUsers, memberOrganizations } = data?.hub.community ?? {};
      return {
        leadUsers,
        memberUsers,
        memberOrganizations,
        host: data?.hub.host,
      };
    },
    { hubId }
  );

  const { t } = useTranslation();

  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const hostOrganization = useMemo(() => host && user && toOrganizationCardProps(host, user, t), [host, user]);

  return (
    <CommunityPage entityTypeName="hub" paths={paths} hubId={hubId} communityId={communityId}>
      <HostOrganization organization={hostOrganization} loading={loading} />
      <CommunityContributorsSection resourceId={hubId} isHub {...contributors} />
    </CommunityPage>
  );
};
export default HubCommunityPage;

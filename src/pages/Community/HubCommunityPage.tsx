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
import { Accordion } from '../../components/composite/common/Accordion/Accordion';
import ContributingUsers from '../../domain/community/CommunityContributors/ContributingUsers';

const HubCommunityPage: FC<PageProps> = ({ paths }) => {
  const { hubId, communityId } = useHub();

  const { host, leadUsers, memberContributors, loading } = useCommunityContributors(
    useHubCommunityContributorsQuery,
    data => {
      const { leadUsers, memberUsers, memberOrganizations } = data?.hub.community ?? {};
      return {
        leadUsers,
        host: data?.hub.host,
        memberContributors: {
          users: memberUsers,
          organizations: memberOrganizations,
        },
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
      <Accordion title={t('community.leading-users')} ariaKey="lead-users" loading={loading}>
        <ContributingUsers users={leadUsers} loading={loading} />
      </Accordion>
      <CommunityContributorsSection
        resourceId={hubId}
        {...memberContributors}
        loading={loading}
        contributorType="member"
      />
    </CommunityPage>
  );
};
export default HubCommunityPage;

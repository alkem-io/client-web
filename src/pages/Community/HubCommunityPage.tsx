import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useHub, useUserContext } from '../../hooks';
import CommunityPage from './CommunityPage';
import CommunityContributors from '../../domain/community/CommunityContributors/CommunityContributors';
import useOrganizationCardProps, {
  toOrganizationCardProps,
} from '../../domain/community/utils/useOrganizationCardProps';
import useUserCardProps from '../../domain/community/utils/useUserCardProps';
import { useHubCommunityPageCommunityMembersQuery } from '../../hooks/generated/graphql';
import { useTranslation } from 'react-i18next';
import HostOrganization from '../../domain/community/CommunityContributors/HostOrganization';

const HubCommunityPage: FC<PageProps> = ({ paths }) => {
  const { hubId, communityId } = useHub();

  const { data, loading } = useHubCommunityPageCommunityMembersQuery({
    variables: { hubId },
    skip: !hubId,
  });

  const { host } = data?.hub || {};
  const { leadUsers, memberUsers, memberOrganizations } = data?.hub.community ?? {};

  const { t } = useTranslation();

  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const hostOrganization = useMemo(() => host && user && toOrganizationCardProps(host, user, t), [host]);

  return (
    <CommunityPage entityTypeName="hub" paths={paths} hubId={hubId} communityId={communityId}>
      <HostOrganization organization={hostOrganization} loading={loading} />
      <CommunityContributors
        title={t('pages.generic.sections.community.leading-contributors')}
        ariaKey="leading-contributors"
        organizations={undefined}
        users={useUserCardProps(leadUsers, hubId)}
        organizationsCount={undefined}
        usersCount={leadUsers?.length}
        loading={loading}
        hideOrganizations
      />
      <CommunityContributors
        title={t('pages.generic.sections.community.contributors')}
        ariaKey="contributors"
        organizations={useOrganizationCardProps(memberOrganizations)}
        users={useUserCardProps(memberUsers, hubId)}
        organizationsCount={memberOrganizations?.length}
        usersCount={memberUsers?.length}
        loading={loading}
      />
    </CommunityPage>
  );
};
export default HubCommunityPage;

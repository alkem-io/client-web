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
import useSearchAcrossMultipleLists from '../../domain/shared/utils/useSearchAcrossMultipleLists';
import { userCardValueGetter } from '../../components/core/card-filter/value-getters/cards/user-card-value-getter';
import { organizationCardValueGetter } from './ChallengeCommunityPage';
import { SectionSpacer } from '../../components/core/Section/Section';
import CommunityContributorsSearch from '../../domain/community/CommunityContributors/CommunityContributorsSearch';

const HubCommunityPage: FC<PageProps> = ({ paths }) => {
  const { hubId, communityId } = useHub();

  const { host, loading, ...contributors } = useCommunityContributors(
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

  const { leadUsers, memberUsers, memberOrganizations, searchTerms, onSearchTermsChange } =
    useSearchAcrossMultipleLists(contributors, {
      leadUsers: userCardValueGetter,
      memberUsers: userCardValueGetter,
      memberOrganizations: organizationCardValueGetter,
    });

  const { t } = useTranslation();

  const { user: userMetadata } = useUserContext();
  const user = userMetadata?.user;

  const hostOrganization = useMemo(() => host && user && toOrganizationCardProps(host, user, t), [host, user]);

  return (
    <CommunityPage entityTypeName="hub" paths={paths} hubId={hubId} communityId={communityId}>
      <HostOrganization organization={hostOrganization} loading={loading} />
      <SectionSpacer />
      <CommunityContributorsSearch value={searchTerms} onChange={onSearchTermsChange} />
      <SectionSpacer />
      <Accordion title={t('community.leading-users')} ariaKey="lead-users" loading={loading}>
        <ContributingUsers users={leadUsers} loading={loading} />
      </Accordion>
      <CommunityContributorsSection
        resourceId={hubId}
        organizations={memberOrganizations}
        users={memberUsers}
        loading={loading}
        contributorType="member"
      />
    </CommunityPage>
  );
};
export default HubCommunityPage;

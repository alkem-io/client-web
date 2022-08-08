import React, { FC, useMemo } from 'react';
import { useHub, useUserContext } from '../../../hooks';
import CommunityUpdates from '../CommunityUpdates/CommunityUpdates';
import { toOrganizationCardProps } from '../utils/useOrganizationCardProps';
import { useHubCommunityContributorsQuery } from '../../../hooks/generated/graphql';
import { useTranslation } from 'react-i18next';
import HostOrganization from '../CommunityContributors/HostOrganization';
import CommunityContributorsSection from '../CommunityContributors/CommunityContributorsSection';
import useCommunityContributors from '../CommunityContributors/useCommunityContributors';
import { Accordion } from '../../../components/composite/common/Accordion/Accordion';
import ContributingUsers from '../CommunityContributors/ContributingUsers';
import useSearchAcrossMultipleLists from '../../shared/utils/useSearchAcrossMultipleLists';
import { userCardValueGetter } from '../../../components/core/card-filter/value-getters/cards/user-card-value-getter';
import { organizationCardValueGetter } from './ChallengeCommunityView';
import { SectionSpacer } from '../../shared/components/Section/Section';
import CommunityContributorsSearch from '../CommunityContributors/CommunityContributorsSearch';
import useUserCardProps from '../utils/useUserCardProps';

const HubCommunityView: FC = () => {
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

  const leadUserCards = useUserCardProps(leadUsers, hubId);

  return (
    <>
      <CommunityUpdates hubId={hubId} communityId={communityId} />
      <HostOrganization organization={hostOrganization} loading={loading} />
      <SectionSpacer />
      <CommunityContributorsSearch value={searchTerms} onChange={onSearchTermsChange} />
      <SectionSpacer />
      <Accordion title={t('community.leading-users')} ariaKey="lead-users" loading={loading}>
        <ContributingUsers users={leadUserCards} loading={loading} />
      </Accordion>
      <CommunityContributorsSection
        resourceId={hubId}
        organizations={memberOrganizations}
        users={memberUsers}
        loading={loading}
        contributorType="member"
      />
    </>
  );
};
export default HubCommunityView;

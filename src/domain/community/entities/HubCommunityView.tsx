import React, { FC, useMemo } from 'react';
import { useHub, useUserContext } from '../../../hooks';
import { toOrganizationCardProps } from '../utils/useOrganizationCardProps';
import { useHubCommunityContributorsQuery } from '../../../hooks/generated/graphql';
import { useTranslation } from 'react-i18next';
import CommunityContributorsSection from '../CommunityContributors/CommunityContributorsSection';
import useCommunityContributors from '../CommunityContributors/useCommunityContributors';
import ContributingUsers from '../CommunityContributors/ContributingUsers';
import useSearchAcrossMultipleLists from '../../shared/utils/useSearchAcrossMultipleLists';
import { userCardValueGetter } from '../../../common/components/core/card-filter/value-getters/cards/user-card-value-getter';
import { organizationCardValueGetter } from './ChallengeCommunityView';
import { SectionSpacer } from '../../shared/components/Section/Section';
import CommunityContributorsSearch from '../CommunityContributors/CommunityContributorsSearch';
import useUserCardProps from '../utils/useUserCardProps';
import ContributingOrganizations from '../CommunityContributors/ContributingOrganizations';
import DashboardGenericSection from '../../shared/components/DashboardSections/DashboardGenericSection';
import SectionHeader from '../../shared/components/Section/SectionHeader';

const HubCommunityView: FC = () => {
  const { hubId } = useHub();

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
      <CommunityContributorsSearch value={searchTerms} onChange={onSearchTermsChange} />
      <SectionSpacer />
      <DashboardGenericSection
        headerText={t('pages.community.hub-host.title')}
        helpText={t('pages.community.hub-host.help-text')}
      >
        <ContributingOrganizations organizations={hostOrganization ? [hostOrganization] : []} loading={loading} />
        <SectionSpacer />
        <SectionHeader text={t('community.leading-users')} />
        <SectionSpacer />
        <ContributingUsers users={leadUserCards} loading={loading} />
      </DashboardGenericSection>
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

import React, { FC, useMemo } from 'react';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import { useUserContext } from '../../contributor/user';
import { toOrganizationCardProps } from '../utils/useOrganizationCardProps';
import { useHubCommunityContributorsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import CommunityContributorsSection from '../CommunityContributors/CommunityContributorsSection';
import useCommunityContributors from '../CommunityContributors/useCommunityContributors';
import useSearchAcrossMultipleLists from '../../../shared/utils/useSearchAcrossMultipleLists';
import { userCardValueGetter } from '../../../../common/components/core/card-filter/value-getters/userCardValueGetter';
import { organizationCardValueGetter } from './ChallengeCommunityView';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import CommunityContributorsSearch from '../CommunityContributors/CommunityContributorsSearch';
import ContributingOrganizations from '../CommunityContributors/ContributingOrganizations';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import SectionHeader from '../../../shared/components/Section/SectionHeader';
import LeadUserCard from '../LeadUserCard/LeadUserCard';
import { buildUserProfileUrl } from '../../../../common/utils/urlBuilders';

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

  const hostOrganization = useMemo(() => host && user && toOrganizationCardProps(host, user, t), [host, user, t]);

  const leadUserCards = useMemo(() => {
    return leadUsers?.map(user => ({
      id: user.id,
      userUrl: buildUserProfileUrl(user.nameID),
      fullName: user.profile.displayName,
      city: user.profile?.location?.city,
      country: user.profile?.location?.country,
      avatarUrl: user.profile.visual?.uri,
      tags: user.profile?.tagsets?.flatMap(({ tags }) => tags),
    }));
  }, [leadUsers]);

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
        {leadUserCards?.map(user => (
          <LeadUserCard key={user.id} {...user} />
        ))}
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

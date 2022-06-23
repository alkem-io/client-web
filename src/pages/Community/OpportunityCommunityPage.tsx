import React, { FC } from 'react';
import { PageProps } from '../common';
import { useOpportunity } from '../../hooks';
import CommunityPage from './CommunityPage';
import { useOpportunityCommunityContributorsQuery } from '../../hooks/generated/graphql';
import CommunityContributorsSection from '../../domain/community/CommunityContributors/CommunityContributorsSection';
import useCommunityContributors from '../../domain/community/CommunityContributors/useCommunityContributors';
import useSearchAcrossMultipleLists from '../../domain/shared/utils/useSearchAcrossMultipleLists';
import { userCardValueGetter } from '../../components/core/card-filter/value-getters/cards/user-card-value-getter';
import { organizationCardValueGetter } from './ChallengeCommunityPage';
import { SectionSpacer } from '../../domain/shared/components/Section/Section';
import CommunityContributorsSearch from '../../domain/community/CommunityContributors/CommunityContributorsSearch';

const OpportunityCommunityPage: FC<PageProps> = ({ paths }) => {
  const { opportunity, hubId } = useOpportunity();
  const communityId = opportunity?.community?.id;
  const opportunityId = opportunity?.id;

  const { loading, ...contributors } = useCommunityContributors(
    useOpportunityCommunityContributorsQuery,
    data => {
      const { leadUsers, memberUsers, leadOrganizations, memberOrganizations } = data?.hub.opportunity.community || {};
      return { leadUsers, memberUsers, leadOrganizations, memberOrganizations };
    },
    {
      hubId,
      opportunityId,
    }
  );

  const { leadUsers, memberUsers, leadOrganizations, memberOrganizations, searchTerms, onSearchTermsChange } =
    useSearchAcrossMultipleLists(contributors, {
      leadUsers: userCardValueGetter,
      memberUsers: userCardValueGetter,
      leadOrganizations: organizationCardValueGetter,
      memberOrganizations: organizationCardValueGetter,
    });

  return (
    <CommunityPage entityTypeName="opportunity" paths={paths} hubId={hubId} communityId={communityId}>
      <SectionSpacer />
      <CommunityContributorsSearch value={searchTerms} onChange={onSearchTermsChange} />
      <SectionSpacer />
      <CommunityContributorsSection
        resourceId={opportunityId}
        organizations={leadOrganizations}
        users={leadUsers}
        loading={loading}
        contributorType="leading"
      />
      <CommunityContributorsSection
        resourceId={opportunityId}
        organizations={memberOrganizations}
        users={memberUsers}
        loading={loading}
        contributorType="member"
      />
    </CommunityPage>
  );
};
export default OpportunityCommunityPage;

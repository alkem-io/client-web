import React, { FC } from 'react';
import { useOpportunity } from '../../../hooks';
import CommunityUpdates from '../CommunityUpdates/CommunityUpdates';
import { useOpportunityCommunityContributorsQuery } from '../../../hooks/generated/graphql';
import CommunityContributorsSection from '../CommunityContributors/CommunityContributorsSection';
import useCommunityContributors from '../CommunityContributors/useCommunityContributors';
import useSearchAcrossMultipleLists from '../../shared/utils/useSearchAcrossMultipleLists';
import { userCardValueGetter } from '../../../components/core/card-filter/value-getters/cards/user-card-value-getter';
import { organizationCardValueGetter } from './ChallengeCommunityView';
import { SectionSpacer } from '../../shared/components/Section/Section';
import CommunityContributorsSearch from '../CommunityContributors/CommunityContributorsSearch';

const OpportunityCommunityView: FC = () => {
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
    <>
      <CommunityUpdates hubId={hubId} communityId={communityId} />
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
    </>
  );
};
export default OpportunityCommunityView;

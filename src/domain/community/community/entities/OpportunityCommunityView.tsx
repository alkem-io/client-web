import React, { FC } from 'react';
import { useOpportunity } from '../../../challenge/opportunity/hooks/useOpportunity';
import { useOpportunityCommunityContributorsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import CommunityContributorsSection from '../CommunityContributors/CommunityContributorsSection';
import useCommunityContributors from '../CommunityContributors/useCommunityContributors';
import useSearchAcrossMultipleLists from '../../../shared/utils/useSearchAcrossMultipleLists';
import { userCardValueGetter } from '../../../../common/components/core/card-filter/value-getters/userCardValueGetter';
import { organizationCardValueGetter } from './ChallengeCommunityView';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import CommunityContributorsSearch from '../CommunityContributors/CommunityContributorsSearch';

const OpportunityCommunityView: FC = () => {
  const { opportunity, hubId } = useOpportunity();
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
      <CommunityContributorsSearch value={searchTerms} onChange={onSearchTermsChange} />
      <SectionSpacer />
      <CommunityContributorsSection
        organizations={leadOrganizations}
        users={leadUsers}
        loading={loading}
        contributorType="leading"
      />
      <CommunityContributorsSection
        organizations={memberOrganizations}
        users={memberUsers}
        loading={loading}
        contributorType="member"
      />
    </>
  );
};

export default OpportunityCommunityView;

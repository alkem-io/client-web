import React, { FC } from 'react';
import { useChallenge } from '../../../hooks';
import CommunityUpdates from '../CommunityUpdates/CommunityUpdates';
import { useChallengeCommunityContributorsQuery } from '../../../hooks/generated/graphql';
import { SectionSpacer } from '../../shared/components/Section/Section';
import CommunityContributorsSection from '../CommunityContributors/CommunityContributorsSection';
import useCommunityContributors from '../CommunityContributors/useCommunityContributors';
import CommunityContributorsSearch from '../CommunityContributors/CommunityContributorsSearch';
import { ValueType } from '../../../components/core/card-filter/filterFn';
import { userCardValueGetter } from '../../../components/core/card-filter/value-getters/cards/user-card-value-getter';
import { Identifiable } from '../../shared/types/Identifiable';
import { OrganizationCardFragment } from '../../../models/graphql-schema';
import useSearchAcrossMultipleLists from '../../shared/utils/useSearchAcrossMultipleLists';

export const organizationCardValueGetter = ({
  id,
  displayName,
}: OrganizationCardFragment & Identifiable): ValueType => ({
  id: id,
  values: [displayName],
});

const ChallengeCommunityView: FC = () => {
  const { challenge, hubId } = useChallenge();
  const communityId = challenge?.community?.id;
  const challengeId = challenge?.id;

  const { loading, ...contributors } = useCommunityContributors(
    useChallengeCommunityContributorsQuery,
    data => {
      const { leadUsers, memberUsers, leadOrganizations, memberOrganizations } = data?.hub.challenge.community || {};
      return { leadUsers, memberUsers, leadOrganizations, memberOrganizations };
    },
    {
      hubId,
      challengeId,
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
        resourceId={challengeId}
        organizations={leadOrganizations}
        users={leadUsers}
        loading={loading}
        contributorType="leading"
      />
      <CommunityContributorsSection
        resourceId={challengeId}
        organizations={memberOrganizations}
        users={memberUsers}
        loading={loading}
        contributorType="member"
      />
    </>
  );
};

export default ChallengeCommunityView;

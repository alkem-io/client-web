import React, { FC } from 'react';
import { PageProps } from '../common';
import { useChallenge } from '../../hooks';
import CommunityPage from './CommunityPage';
import { useChallengeCommunityContributorsQuery } from '../../hooks/generated/graphql';
import { SectionSpacer } from '../../domain/shared/components/Section/Section';
import CommunityContributorsSection from '../../domain/community/CommunityContributors/CommunityContributorsSection';
import useCommunityContributors from '../../domain/community/CommunityContributors/useCommunityContributors';
import CommunityContributorsSearch from '../../domain/community/CommunityContributors/CommunityContributorsSearch';
import { ValueType } from '../../components/core/card-filter/filterFn';
import { userCardValueGetter } from '../../components/core/card-filter/value-getters/cards/user-card-value-getter';
import { Identifiable } from '../../domain/shared/types/Identifiable';
import { OrganizationCardFragment } from '../../models/graphql-schema';
import useSearchAcrossMultipleLists from '../../domain/shared/utils/useSearchAcrossMultipleLists';

export const organizationCardValueGetter = ({
  id,
  displayName,
}: OrganizationCardFragment & Identifiable): ValueType => ({
  id: id,
  values: [displayName],
});

const ChallengeCommunityPage: FC<PageProps> = ({ paths }) => {
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
    <CommunityPage entityTypeName="challenge" paths={paths} hubId={hubId} communityId={communityId}>
      <SectionSpacer />
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
    </CommunityPage>
  );
};

export default ChallengeCommunityPage;

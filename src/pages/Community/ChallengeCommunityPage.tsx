import React, { FC } from 'react';
import { PageProps } from '../common';
import { useChallenge } from '../../hooks';
import CommunityPage from './CommunityPage';
import { useChallengeCommunityContributorsQuery } from '../../hooks/generated/graphql';
import { SectionSpacer } from '../../components/core/Section/Section';
import CommunityContributorsSection from '../../domain/community/CommunityContributors/CommunityContributorsSection';
import useCommunityContributors from '../../domain/community/CommunityContributors/useCommunityContributors';

const ChallengeCommunityPage: FC<PageProps> = ({ paths }) => {
  const { challenge, hubId } = useChallenge();
  const communityId = challenge?.community?.id;
  const challengeId = challenge?.id;

  const { leadingContributors, memberContributors, loading } = useCommunityContributors(
    useChallengeCommunityContributorsQuery,
    data => {
      const { leadUsers, memberUsers, leadOrganizations, memberOrganizations } = data?.hub.challenge.community || {};
      return {
        leadingContributors: {
          users: leadUsers,
          organizations: leadOrganizations,
        },
        memberContributors: {
          users: memberUsers,
          organizations: memberOrganizations,
        },
      };
    },
    {
      hubId,
      challengeId,
    }
  );

  return (
    <CommunityPage entityTypeName="challenge" paths={paths} hubId={hubId} communityId={communityId}>
      <SectionSpacer />
      <CommunityContributorsSection
        resourceId={challengeId}
        {...leadingContributors}
        loading={loading}
        contributorType="leading"
      />
      <CommunityContributorsSection
        resourceId={challengeId}
        {...memberContributors}
        loading={loading}
        contributorType="member"
      />
    </CommunityPage>
  );
};

export default ChallengeCommunityPage;

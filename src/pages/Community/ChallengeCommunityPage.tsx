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

  const { contributors, loading } = useCommunityContributors(
    useChallengeCommunityContributorsQuery,
    data => data?.hub.challenge.community,
    {
      hubId,
      challengeId,
    }
  );

  return (
    <CommunityPage entityTypeName="challenge" paths={paths} hubId={hubId} communityId={communityId}>
      <SectionSpacer />
      <CommunityContributorsSection resourceId={challengeId} {...contributors} loading={loading} />
    </CommunityPage>
  );
};

export default ChallengeCommunityPage;

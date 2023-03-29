import React, { FC } from 'react';
import { useChallenge } from '../../../challenge/challenge/hooks/useChallenge';
import { useChallengeCommunityContributorsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import useCommunityContributors from '../CommunityContributors/useCommunityContributors';
import CommunityContributorsView from '../CommunityContributors/CommunityContributorsView';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import useUserCardProps from '../utils/useUserCardProps';
import NoOrganizations from '../CommunityContributors/NoOrganizations';
import { ContributorsDialogContentProps } from '../ContributorsDialog/ContributorsDialog';

const ChallengeContributorsDialogContent: FC<ContributorsDialogContentProps> = ({ dialogOpen }) => {
  const { challenge, hubId } = useChallenge();
  const challengeId = challenge?.id;

  const { loading, memberUsers, memberOrganizations } = useCommunityContributors(
    useChallengeCommunityContributorsQuery,
    data => {
      const { memberUsers, memberOrganizations } = data?.hub.challenge.community || {};
      return { memberUsers, memberOrganizations };
    },
    {
      hubId,
      challengeId,
    },
    !dialogOpen
  );

  return (
    <CommunityContributorsView
      organizations={useOrganizationCardProps(memberOrganizations)}
      users={useUserCardProps(memberUsers)}
      organizationsCount={memberOrganizations?.length}
      usersCount={memberUsers?.length}
      noOrganizationsView={<NoOrganizations type={'member'} />}
      loading={loading}
    />
  );
};

export default ChallengeContributorsDialogContent;

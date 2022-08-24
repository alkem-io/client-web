import React, { FC } from 'react';
import { useChallenge } from '../../../hooks';
import { useChallengeCommunityContributorsQuery } from '../../../hooks/generated/graphql';
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
    <>
      <CommunityContributorsView
        organizations={useOrganizationCardProps(memberOrganizations)}
        users={useUserCardProps(memberUsers, hubId)}
        organizationsCount={memberOrganizations?.length}
        usersCount={memberUsers?.length}
        noOrganizationsView={<NoOrganizations type={'member'} />}
        loading={loading}
      />
    </>
  );
};

export default ChallengeContributorsDialogContent;

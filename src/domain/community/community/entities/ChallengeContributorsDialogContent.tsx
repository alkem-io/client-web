import React, { FC } from 'react';
import { useSpaceCommunityContributorsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import CommunityContributorsView from '../CommunityContributors/CommunityContributorsView';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import useUserCardProps from '../utils/useUserCardProps';
import NoOrganizations from '../CommunityContributors/NoOrganizations';
import { ContributorsDialogContentProps } from '../ContributorsDialog/ContributorsDialog';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

const ChallengeContributorsDialogContent: FC<ContributorsDialogContentProps> = ({ dialogOpen }) => {
  const { subSpaceId: challengeId } = useRouteResolver();

  const { loading, data } = useSpaceCommunityContributorsQuery({
    variables: {
      spaceId: challengeId!,
    },
    skip: !dialogOpen || !challengeId,
  });

  const { memberUsers, memberOrganizations } = data?.lookup.space?.community ?? {};

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

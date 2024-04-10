import React, { FC } from 'react';
import { useSpaceCommunityContributorsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import CommunityContributorsView from '../CommunityContributors/CommunityContributorsView';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import useUserCardProps from '../utils/useUserCardProps';
import NoOrganizations from '../CommunityContributors/NoOrganizations';
import { ContributorsDialogContentProps } from '../ContributorsDialog/ContributorsDialog';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

const OpportunityContributorsDialogContent: FC<ContributorsDialogContentProps> = ({ dialogOpen }) => {
  const { subSubSpaceId: opportunityId } = useRouteResolver();

  const { loading, data } = useSpaceCommunityContributorsQuery({
    variables: {
      spaceId: opportunityId!,
    },
    skip: !dialogOpen || !opportunityId,
  });

  const { memberUsers, memberOrganizations } = data?.space?.community ?? {};

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

export default OpportunityContributorsDialogContent;

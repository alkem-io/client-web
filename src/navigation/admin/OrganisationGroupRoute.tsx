import React, { FC } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { WithParentMembersProps } from '../../components/Admin/Community/CommunityTypes';
import { useOrganisationGroupQuery } from '../../generated/graphql';
import { GroupRoute } from './GroupRoute';

interface GroupRouteProps extends WithParentMembersProps {}

interface OrgRouteParams {
  groupId: string;
  organizationId: string;
}

export const OrganisationGroupRoute: FC<GroupRouteProps> = ({ paths, parentMembers }) => {
  const { path, url } = useRouteMatch();
  const { groupId, organizationId } = useParams<OrgRouteParams>();

  const { data, loading } = useOrganisationGroupQuery({ variables: { organisationId: organizationId, groupId } });

  return (
    <GroupRoute
      loading={loading}
      group={data?.organisation.group}
      parentMembers={parentMembers}
      paths={paths}
      path={path}
      url={url}
    />
  );
};

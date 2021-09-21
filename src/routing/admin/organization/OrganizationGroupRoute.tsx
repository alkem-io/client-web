import React, { FC, useMemo } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { useOrganizationGroupQuery } from '../../../hooks/generated/graphql';
import { PageProps } from '../../../pages';
import { GroupRoute } from '../GroupRoute';

interface GroupRouteProps extends PageProps {}

interface OrgRouteParams {
  groupId: string;
  organizationId: string;
}

export const OrganizationGroupRoute: FC<GroupRouteProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { groupId, organizationId } = useParams<OrgRouteParams>();

  const { data, loading } = useOrganizationGroupQuery({
    variables: { organizationId: organizationId, groupId },
    fetchPolicy: 'cache-and-network',
  });
  const parentMembers = useMemo(() => data?.organization.members || [], [data]);

  return (
    <GroupRoute
      loading={loading}
      group={data?.organization.group}
      parentMembers={parentMembers}
      paths={paths}
      path={path}
      url={url}
    />
  );
};

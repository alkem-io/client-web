import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useOrganizationGroupQuery } from '../../../hooks/generated/graphql';
import { PageProps } from '../../../pages';
import { GroupRoute } from '../GroupRoute';
import { useUrlParams } from '../../../hooks';

interface GroupRouteProps extends PageProps {}

export const OrganizationGroupRoute: FC<GroupRouteProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { groupId, organizationNameId } = useUrlParams();

  const { data, loading } = useOrganizationGroupQuery({
    variables: { organizationId: organizationNameId, groupId },
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

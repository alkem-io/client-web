import React, { FC, useMemo } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { useOrganisationGroupQuery } from '../../../hooks/generated/graphql';
import { PageProps } from '../../../pages';
import { GroupRoute } from '../GroupRoute';

interface GroupRouteProps extends PageProps {}

interface OrgRouteParams {
  groupId: string;
  organizationId: string;
}

export const OrganisationGroupRoute: FC<GroupRouteProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { groupId, organizationId } = useParams<OrgRouteParams>();

  const { data, loading } = useOrganisationGroupQuery({
    variables: { organisationId: organizationId, groupId },
    fetchPolicy: 'cache-and-network',
  });
  const parentMembers = useMemo(() => data?.organisation.members || [], [data]);

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

import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../../hooks';
import { useOrganizationGroupQuery } from '../../../hooks/generated/graphql';
import { PageProps } from '../../../pages';
import { GroupRoute } from '../GroupRoute';

interface GroupRouteProps extends PageProps {}

export const OrganizationGroupRoute: FC<GroupRouteProps> = ({ paths }) => {
  const { groupId = '', organizationNameId = '' } = useUrlParams();

  // TODO: find a place for this one.
  const { data, loading } = useOrganizationGroupQuery({
    variables: { organizationId: organizationNameId, groupId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const parentMembers = useMemo(() => data?.organization.members || [], [data]);

  return <GroupRoute loading={loading} group={data?.organization.group} parentMembers={parentMembers} paths={paths} />;
};

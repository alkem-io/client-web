import React, { FC } from 'react';
import { useUrlParams } from '@/core/routing/useUrlParams';
import { useOrganizationGroupQuery } from '@/core/apollo/generated/apollo-hooks';
import { GroupRoute } from '../routing/GroupRoute';

export const OrganizationGroupRoute: FC = () => {
  const { groupId = '', organizationNameId = '' } = useUrlParams();

  // TODO: find a place for this one.
  const { data, loading } = useOrganizationGroupQuery({
    variables: { organizationId: organizationNameId, groupId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  return <GroupRoute loading={loading} group={data?.organization.group} />;
};

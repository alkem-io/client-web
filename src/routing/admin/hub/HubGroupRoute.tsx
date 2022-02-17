import React, { FC } from 'react';
import { WithCommunity } from '../../../components/Admin/Community/CommunityTypes';
import { useUrlParams } from '../../../hooks';
import { useHubGroupQuery } from '../../../hooks/generated/graphql';
import { PageProps } from '../../../pages';
import { GroupRoute } from '../GroupRoute';

interface GroupRouteProps extends PageProps, WithCommunity {}

export const HubGroupRoute: FC<GroupRouteProps> = ({ paths, parentCommunityId }) => {
  const { groupId = '', hubNameId = '' } = useUrlParams();

  const { data, loading } = useHubGroupQuery({
    variables: { hubId: hubNameId, groupId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  return <GroupRoute loading={loading} group={data?.hub.group} parentCommunityId={parentCommunityId} paths={paths} />;
};

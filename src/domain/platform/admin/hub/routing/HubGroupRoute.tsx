import React, { FC } from 'react';
import { WithCommunity } from '../../components/Community/CommunityTypes';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { useHubGroupQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { GroupRoute } from '../../routing/GroupRoute';

interface GroupRouteProps extends WithCommunity {}

export const HubGroupRoute: FC<GroupRouteProps> = ({ parentCommunityId }) => {
  const { groupId = '', hubNameId = '' } = useUrlParams();

  const { data, loading } = useHubGroupQuery({
    variables: { hubId: hubNameId, groupId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  return <GroupRoute loading={loading} group={data?.hub.group} parentCommunityId={parentCommunityId} />;
};

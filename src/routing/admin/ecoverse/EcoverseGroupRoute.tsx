import React, { FC } from 'react';
import { WithCommunity } from '../../../components/Admin/Community/CommunityTypes';
import { useUrlParams } from '../../../hooks';
import { useEcoverseGroupQuery } from '../../../hooks/generated/graphql';
import { PageProps } from '../../../pages';
import { GroupRoute } from '../GroupRoute';

interface GroupRouteProps extends PageProps, WithCommunity {}

export const EcoverseGroupRoute: FC<GroupRouteProps> = ({ paths, parentCommunityId }) => {
  const { groupId = '', ecoverseNameId = '' } = useUrlParams();

  const { data, loading } = useEcoverseGroupQuery({
    variables: { ecoverseId: ecoverseNameId, groupId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  return (
    <GroupRoute loading={loading} group={data?.ecoverse.group} parentCommunityId={parentCommunityId} paths={paths} />
  );
};

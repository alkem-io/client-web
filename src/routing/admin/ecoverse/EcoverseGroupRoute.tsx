import React, { FC } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { WithOptionalMembersProps } from '../../../components/Admin/Community/CommunityTypes';
import { useEcoverseGroupQuery } from '../../../hooks/generated/graphql';
import { GroupRoute } from '../GroupRoute';
import { useUrlParams } from '../../../hooks';

interface GroupRouteProps extends WithOptionalMembersProps {}

export const EcoverseGroupRoute: FC<GroupRouteProps> = ({ paths, parentMembers }) => {
  const { path, url } = useRouteMatch();
  const { groupId, ecoverseId } = useUrlParams();

  const { data, loading } = useEcoverseGroupQuery({
    variables: { ecoverseId, groupId },
    fetchPolicy: 'cache-and-network',
  });

  return (
    <GroupRoute
      loading={loading}
      group={data?.ecoverse.group}
      parentMembers={parentMembers}
      paths={paths}
      path={path}
      url={url}
    />
  );
};

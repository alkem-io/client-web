import React, { FC } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { WithMaybeParentMembersProps } from '../../../components/Admin/Community/CommunityTypes';
import { useEcoverseGroupQuery } from '../../../hooks/generated/graphql';
import { GroupRoute } from '../GroupRoute';

interface GroupRouteProps extends WithMaybeParentMembersProps {}

interface EcoverseGroupParams {
  groupId: string;
  ecoverseId: string;
}

export const EcoverseGroupRoute: FC<GroupRouteProps> = ({ paths, parentMembers }) => {
  const { path, url } = useRouteMatch();
  const { groupId, ecoverseId } = useParams<EcoverseGroupParams>();

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

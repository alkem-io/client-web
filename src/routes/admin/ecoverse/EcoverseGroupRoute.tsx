import React, { FC } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { WithParentMembersProps } from '../../../components/Admin/Community/CommunityTypes';
import { useEcoverseGroupQuery } from '../../../generated/graphql';
import { GroupRoute } from '../GroupRoute';

interface GroupRouteProps extends WithParentMembersProps {}

interface EcoverseGroupParams {
  groupId: string;
  ecoverseId: string;
}

export const EcoverseGroupRoute: FC<GroupRouteProps> = ({ paths, parentMembers }) => {
  const { path, url } = useRouteMatch();
  const { groupId, ecoverseId } = useParams<EcoverseGroupParams>();

  const { data, loading } = useEcoverseGroupQuery({ variables: { ecoverseId, groupId } });

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

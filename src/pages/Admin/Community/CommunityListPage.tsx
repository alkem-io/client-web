import React, { FC, useMemo } from 'react';

import { ListPage } from '../../../components/Admin';
import { Loading } from '../../../components/core';
import { useDeleteUserGroup, useEcoverse } from '../../../hooks';
import { useCommunityGroupsQuery } from '../../../hooks/generated/graphql';
import { PageProps } from '../../common';

interface CommunityGroupListPageProps extends PageProps {
  communityId: string;
}

export const CommunityGroupListPage: FC<CommunityGroupListPageProps> = ({ paths, communityId }) => {
  const url = '';
  const { ecoverseId, loading: loadingEcoverse } = useEcoverse();

  const { data, loading } = useCommunityGroupsQuery({
    variables: {
      ecoverseId,
      communityId,
    },
  });
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths, url]);
  const { handleDelete } = useDeleteUserGroup();

  const community = data?.ecoverse.community;
  const groupsList = community?.groups?.map(u => ({ id: u.id, value: u.name, url: `${url}/${u.id}` })) || [];

  if (loading || loadingEcoverse) return <Loading />;

  return (
    <ListPage
      data={groupsList}
      paths={currentPaths}
      title={community ? `${community?.displayName} Groups` : 'Groups'}
      onDelete={x => handleDelete(x.id)}
      newLink={`${url}/new`}
    />
  );
};

export default CommunityGroupListPage;

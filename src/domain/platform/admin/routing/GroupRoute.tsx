import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { GroupPage } from '../components';
import { WithCommunity } from '../components/Community/CommunityTypes';
import EditMembersPage from '../components/Group/EditMembersPage';
import { Loading } from '../../../../common/components/core';
import { UserGroup } from '../../../../core/apollo/generated/graphql-schema';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { PageProps } from '../../../shared/types/PageProps';

interface Props extends PageProps, WithCommunity {
  group?: UserGroup;
  loading?: boolean;
}

export const GroupRoute: FC<Props> = ({ paths, group, loading = false, parentCommunityId }) => {
  const { pathname: url } = useResolvedPath('.');
  const groupName = group?.name || '';

  const currentPaths = useMemo(() => [...paths, { value: url, name: groupName, real: true }], [paths, url, groupName]);

  if (loading) return <Loading text={'Loading group'} />;

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<GroupPage paths={paths} group={group} />} />
        <Route
          path={'members'}
          element={
            <EditMembersPage paths={currentPaths} parentCommunityId={parentCommunityId} groupId={group?.id || ''} />
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { GroupPage } from '../components';
import { WithCommunity } from '../components/Community/CommunityTypes';
import EditMembersPage from '../components/Group/EditMembersPage';
import { Loading } from '../../../../common/components/core';
import { GroupInfoFragment } from '../../../../core/apollo/generated/graphql-schema';
import { Error404 } from '../../../../core/pages/Errors/Error404';

interface Props extends WithCommunity {
  group?: GroupInfoFragment;
  loading?: boolean;
}

export const GroupRoute: FC<Props> = ({ group, loading = false, parentCommunityId }) => {
  if (loading) return <Loading text={'Loading group'} />;

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<GroupPage group={group} />} />
        <Route
          path={'members'}
          element={<EditMembersPage parentCommunityId={parentCommunityId} groupId={group?.id || ''} />}
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

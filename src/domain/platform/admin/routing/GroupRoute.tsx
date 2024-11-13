import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import GroupPage from '../components/Group/GroupPage';
import EditMembersPage from '../components/Group/EditMembersPage';
import Loading from '@core/ui/loading/Loading';
import { GroupInfoFragment } from '@core/apollo/generated/graphql-schema';
import { Error404 } from '@core/pages/Errors/Error404';

interface Props {
  group?: GroupInfoFragment;
  loading?: boolean;
  parentCommunityId?: string;
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

import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CreateCommunityGroup } from '../../components/Community/CreateCommunityGroup';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
import { SpaceGroupRoute } from '../../space/routing/SpaceGroupRoute';

interface CommunityGroupsAdminRoutesProps {
  communityId?: string;
  parentCommunityId?: string;
}

const CommunityGroupsAdminRoutes: FC<CommunityGroupsAdminRoutesProps> = ({ communityId, parentCommunityId }) => {
  return (
    <Routes>
      <Route path="new" element={<CreateCommunityGroup communityId={communityId} />} />
      <Route path={`:${nameOfUrl.groupId}/*`} element={<SpaceGroupRoute parentCommunityId={parentCommunityId} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default CommunityGroupsAdminRoutes;

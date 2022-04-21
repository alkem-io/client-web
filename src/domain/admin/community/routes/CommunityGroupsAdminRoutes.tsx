import React, { FC } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { WithCommunity } from '../../../../components/Admin/Community/CommunityTypes';
import { CreateCommunityGroup } from '../../../../components/Admin/Community/CreateCommunityGroup';
import { Error404, PageProps } from '../../../../pages';
import { nameOfUrl } from '../../../../routing/url-params';
import { HubGroupRoute } from '../../../../routing/admin/hub/HubGroupRoute';
import { useAppendPaths } from '../../../../hooks/usePathUtils';

interface CommunityGroupsAdminRoutesProps extends PageProps, WithCommunity {}

const CommunityGroupsAdminRoutes: FC<CommunityGroupsAdminRoutesProps> = ({ paths, communityId, parentCommunityId }) => {
  const { pathname: url } = useResolvedPath('..');
  const currentPaths = useAppendPaths(paths, { value: `${url}/community`, name: 'community' }, { name: 'groups' });

  return (
    <Routes>
      <Route path="new" element={<CreateCommunityGroup paths={currentPaths} communityId={communityId} />} />
      <Route
        path={`:${nameOfUrl.groupId}/*`}
        element={<HubGroupRoute paths={currentPaths} parentCommunityId={parentCommunityId} />}
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default CommunityGroupsAdminRoutes;

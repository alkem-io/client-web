import React, { FC } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { WithCommunity } from '../../components/Community/CommunityTypes';
import { CreateCommunityGroup } from '../../components/Community/CreateCommunityGroup';
import { PageProps } from '../../../../shared/types/PageProps';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../../core/routing/urlParams';
import { useAppendPaths } from '../../../../../core/routing/usePathUtils';
import { HubGroupRoute } from '../../hub/routing/HubGroupRoute';

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

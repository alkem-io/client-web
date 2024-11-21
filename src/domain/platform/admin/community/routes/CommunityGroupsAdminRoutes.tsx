import { Route, Routes } from 'react-router-dom';
import { CreateCommunityGroup } from '@/domain/platform/admin/components/Community/CreateCommunityGroup';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
import { SpaceGroupRoute } from '@/domain/platform/admin/space/routing/SpaceGroupRoute';

type CommunityGroupsAdminRoutesProps = {
  communityId?: string;
  parentCommunityId?: string;
};

const CommunityGroupsAdminRoutes = ({ communityId, parentCommunityId }: CommunityGroupsAdminRoutesProps) => (
  <Routes>
    <Route path="new" element={<CreateCommunityGroup communityId={communityId} />} />
    <Route path={`:${nameOfUrl.groupId}/*`} element={<SpaceGroupRoute parentCommunityId={parentCommunityId} />} />
    <Route path="*" element={<Error404 />} />
  </Routes>
);

export default CommunityGroupsAdminRoutes;

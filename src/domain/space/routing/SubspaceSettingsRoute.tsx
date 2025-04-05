import { SpaceAdminL1Route } from '@/domain/spaceAdmin/routing/SpaceAdminRouteL1';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import Loading from '@/core/ui/loading/Loading';
import { SpaceAdminL2Route } from '@/domain/spaceAdmin/routing/SpaceAdminRouteL2';

const SubspaceSettingsRoute = () => {
  const { spaceLevel, loading } = useUrlResolver();

  switch (spaceLevel) {
    case SpaceLevel.L1:
      return <SpaceAdminL1Route />;
    case SpaceLevel.L2:
      return <SpaceAdminL2Route />;
  }

  if (loading) {
    return <Loading />;
  }
  return null;
};

export default SubspaceSettingsRoute;

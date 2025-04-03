import { ChallengeRoute } from '@/domain/space/admin/routing/SpaceAdminRouteL1';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import Loading from '@/core/ui/loading/Loading';
import { OpportunityRoute } from '@/domain/space/admin/routing/SpaceAdminRouteL2';

const SubspaceSettingsRoute = () => {
  const { spaceLevel, loading } = useUrlResolver();

  switch (spaceLevel) {
    case SpaceLevel.L1:
      return <ChallengeRoute />;
    case SpaceLevel.L2:
      return <OpportunityRoute />;
  }

  if (loading) {
    return <Loading />;
  }
  return null;
};

export default SubspaceSettingsRoute;

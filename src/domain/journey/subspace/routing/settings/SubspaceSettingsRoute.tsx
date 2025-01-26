import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import { ChallengeRoute } from '@/domain/journey/settings/routes/ChallengeRoute';
import { OpportunityRoute } from '@/domain/journey/settings/routes/OpportunityRoute';
import { OpportunityProvider } from '@/domain/journey/opportunity/context/OpportunityProvider';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

const SubspaceSettingsRoute = () => {
  const { level: spaceLevel } = useRouteResolver();

  switch (spaceLevel) {
    case SpaceLevel.L1:
      return <ChallengeRoute />;
    case SpaceLevel.L2:
      return (
        <OpportunityProvider>
          <OpportunityRoute />
        </OpportunityProvider>
      );
  }

  return null;
};

export default SubspaceSettingsRoute;

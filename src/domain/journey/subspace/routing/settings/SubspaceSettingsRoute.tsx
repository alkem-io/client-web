import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import { ChallengeRoute } from '@/domain/journey/settings/routes/ChallengeRoute';
import { useSubspaceCommunityAndRoleSetIdQuery } from '@/core/apollo/generated/apollo-hooks';
import { OpportunityRoute } from '@/domain/journey/settings/routes/OpportunityRoute';
import { OpportunityProvider } from '@/domain/journey/opportunity/context/OpportunityProvider';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

const SubspaceSettingsRoute = () => {
  const { spaceLevel, parentSpaceId } = useRouteResolver();

  const { data } = useSubspaceCommunityAndRoleSetIdQuery({
    variables: { spaceId: parentSpaceId! },
    skip: !parentSpaceId || spaceLevel !== SpaceLevel.Opportunity,
  });

  switch (spaceLevel) {
    case SpaceLevel.Challenge:
      return <ChallengeRoute />;
    case SpaceLevel.Opportunity:
      return (
        <OpportunityProvider>
          <OpportunityRoute parentCommunityId={data?.lookup.space?.community.id} />
        </OpportunityProvider>
      );
  }

  return null;
};

export default SubspaceSettingsRoute;

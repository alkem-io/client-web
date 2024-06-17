import React from 'react';
import { useRouteResolver } from '../../../../../main/routing/resolvers/RouteResolver';
import { ChallengeRoute } from '../../../settings/routes/ChallengeRoute';
import { useSubspaceCommunityIdQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { OpportunityRoute } from '../../../settings/routes/OpportunityRoute';
import { OpportunityProvider } from '../../../opportunity/context/OpportunityProvider';

const SubspaceSettingsRoute = () => {
  const { journeyLevel, parentJourneyId } = useRouteResolver();

  const { data } = useSubspaceCommunityIdQuery({
    variables: {
      spaceId: parentJourneyId!,
    },
    skip: !parentJourneyId || journeyLevel !== 2,
  });

  switch (journeyLevel) {
    case 1:
      return <ChallengeRoute />;
    case 2:
      return (
        <OpportunityProvider>
          <OpportunityRoute parentCommunityId={data?.lookup.space?.community.id} />
        </OpportunityProvider>
      );
  }

  return null;
};

export default SubspaceSettingsRoute;

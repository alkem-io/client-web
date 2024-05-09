import React from 'react';
import { useRouteResolver } from '../../../../../main/routing/resolvers/RouteResolver';
import { ChallengeRoute } from '../../../../platform/admin/subspace/routing/ChallengeRoute';
import { useSubspaceCommunityIdQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { OpportunityRoute } from '../../../../platform/admin/opportunity/routing/OpportunityRoute';

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
      return <OpportunityRoute parentCommunityId={data?.space.community.id} />;
  }

  return null;
};

export default SubspaceSettingsRoute;

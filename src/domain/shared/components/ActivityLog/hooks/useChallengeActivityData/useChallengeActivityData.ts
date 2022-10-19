import { uniq } from 'lodash';
import { Activity, ActivityEventType } from '../../../../../../models/graphql-schema';
import { useApolloErrorHandler } from '../../../../../../core/apollo/hooks/useApolloErrorHandler';

export const useChallengeActivityData = (activities: Activity[]) => {
  const handleError = useApolloErrorHandler();

  const challengeActivities = uniq(
    activities
      .filter(({ type }) => type === ActivityEventType.ChallengeCreated)
  );
  const challengeIds = challengeActivities.map(({ resourceID }) => resourceID);
  // challenge activities under a single collaboration under a single hub should have the same parent
  const hubId = challengeActivities?.[0].parentID;

  // query for challenges
};

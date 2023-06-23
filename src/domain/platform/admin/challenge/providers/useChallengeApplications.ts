import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { useChallengeApplicationsQuery } from '../../../../../core/apollo/generated/apollo-hooks';

const EMPTY = [];

const useChallengeApplications = () => {
  const { spaceNameId = '', challengeNameId = '' } = useUrlParams();

  const { data, loading } = useChallengeApplicationsQuery({
    variables: { spaceId: spaceNameId, challengeId: challengeNameId },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const applications = data?.space?.challenge?.community?.applications ?? EMPTY;

  return {
    applications,
    loading,
  };
};

export default useChallengeApplications;

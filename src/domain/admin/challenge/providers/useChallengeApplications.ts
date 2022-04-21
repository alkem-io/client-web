import { useUrlParams } from '../../../../hooks';
import { useChallengeApplicationsQuery } from '../../../../hooks/generated/graphql';

const EMPTY = [];

const useChallengeApplications = () => {
  const { hubNameId = '', challengeNameId = '' } = useUrlParams();

  const { data, loading } = useChallengeApplicationsQuery({
    variables: { hubId: hubNameId, challengeId: challengeNameId },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const applications = data?.hub?.challenge?.community?.applications ?? EMPTY;

  return {
    applications,
    loading,
  };
};

export default useChallengeApplications;

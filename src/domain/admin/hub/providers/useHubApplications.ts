import { useUrlParams } from '../../../../hooks';
import { useHubApplicationsQuery } from '../../../../hooks/generated/graphql';

const EMPTY = [];

const useHubApplications = () => {
  const { hubNameId = '' } = useUrlParams();

  const { data, loading } = useHubApplicationsQuery({
    variables: { hubId: hubNameId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const applications = data?.hub?.community?.applications || EMPTY;

  return {
    applications,
    loading,
  };
};

export default useHubApplications;

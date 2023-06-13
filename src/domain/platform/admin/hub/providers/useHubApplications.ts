import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { useHubApplicationsQuery } from '../../../../../core/apollo/generated/apollo-hooks';

const EMPTY = [];
/**
 * @deprecated //!! REMOVE ME
 */
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

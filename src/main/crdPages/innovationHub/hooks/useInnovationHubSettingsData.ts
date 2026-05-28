import { useInnovationHubSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export const useInnovationHubSettingsData = () => {
  const { innovationHubId } = useUrlResolver();

  const { data, loading, refetch } = useInnovationHubSettingsQuery({
    variables: { innovationHubId: innovationHubId! },
    skip: !innovationHubId,
  });

  return {
    hub: data?.platform.innovationHub,
    loading,
    refetch,
  };
};

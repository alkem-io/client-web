import { useJourneyBreadcrumbsInnovationHubQuery } from '@core/apollo/generated/apollo-hooks';

interface TopLevelJourneyBreadcrumbsItem {
  profile?: {
    displayName: string;
    avatar?: {
      uri?: string;
    };
  };
  loading: boolean;
}

const useJourneyBreadcrumbsTopLevelItem = (): TopLevelJourneyBreadcrumbsItem => {
  const { data, loading } = useJourneyBreadcrumbsInnovationHubQuery();

  const innovationHub = data?.platform.innovationHub;

  if (loading) {
    return { loading };
  }

  return {
    profile: innovationHub?.profile,
    loading,
  };
};

export default useJourneyBreadcrumbsTopLevelItem;

import { useInnovationHubBannerWideQuery } from '@/core/apollo/generated/apollo-hooks';

interface TopLevelBreadcrumbsItem {
  profile?: {
    displayName: string;
    bannerWide?: {
      uri?: string;
    };
  };
  loading: boolean;
}

const useBreadcrumbsTopLevelItem = (): TopLevelBreadcrumbsItem => {
  const { data, loading } = useInnovationHubBannerWideQuery();

  const innovationHub = data?.platform.innovationHub;

  if (loading) {
    return { loading };
  }

  return {
    profile: innovationHub?.profile,
    loading,
  };
};

export default useBreadcrumbsTopLevelItem;

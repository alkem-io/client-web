import useInnovationHub from '@/domain/innovationHub/useInnovationHub/useInnovationHub';

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
  const { innovationHub, innovationHubLoading } = useInnovationHub();

  if (innovationHubLoading) {
    return { loading: true };
  }

  return {
    profile: innovationHub
      ? {
          displayName: innovationHub.displayName,
          bannerWide: innovationHub.banner,
        }
      : undefined,
    loading: false,
  };
};

export default useBreadcrumbsTopLevelItem;

import { EntityPageLayout } from '@/domain/journey/common/EntityPageLayout';
import SpaceTabs, { SpaceTabsPlaceholder } from '../Tabs/SpaceTabs';
import { PropsWithChildren } from 'react';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import JourneyBreadcrumbs from '@/domain/journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';
import useInnovationHubJourneyBannerRibbon from '@/domain/innovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import SpacePageBanner from './SpacePageBanner';
import { JourneyPath } from '@/main/routing/urlResolver/UrlResolverProvider';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';

export interface SpacePageLayoutProps {
  currentSection: EntityPageSection;
  journeyPath: JourneyPath | undefined;
  loading?: boolean;
}

const SpacePageLayout = ({
  currentSection,
  journeyPath,
  loading = false,
  children,
}: PropsWithChildren<SpacePageLayoutProps>) => {
  const { spaceId, loading: resolving } = useUrlResolver();

  const { data: spaceData } = useSpaceAboutDetailsQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId || loading,
  });

  const profile = spaceData?.lookup.space?.about.profile;

  const ribbon = useInnovationHubJourneyBannerRibbon({
    spaceId,
  });

  return (
    <EntityPageLayout
      currentSection={currentSection}
      breadcrumbs={<JourneyBreadcrumbs journeyPath={journeyPath} />}
      pageBanner={
        <SpacePageBanner
          title={profile?.displayName}
          tagline={profile?.tagline}
          loading={loading || resolving}
          bannerUrl={profile?.banner?.uri}
          bannerAltText={profile?.banner?.alternativeText}
          ribbon={ribbon}
        />
      }
      tabsComponent={loading ? SpaceTabsPlaceholder : SpaceTabs}
    >
      <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
        {children}
      </StorageConfigContextProvider>
    </EntityPageLayout>
  );
};

export default SpacePageLayout;

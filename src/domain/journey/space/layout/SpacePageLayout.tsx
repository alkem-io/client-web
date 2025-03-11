import { EntityPageLayout } from '@/domain/journey/common/EntityPageLayout';
import SpaceTabs, { SpaceTabsSkeleton } from '../../../space/layout/TabbedSpaceL0/Tabs/SpaceTabs';
import { PropsWithChildren } from 'react';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import JourneyBreadcrumbs from '@/domain/journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';
import { getVisualByType } from '@/domain/common/visual/utils/visuals.utils';
import { VisualName } from '@/domain/common/visual/constants/visuals.constants';
import useInnovationHubJourneyBannerRibbon from '@/domain/innovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import SpacePageBanner from './SpacePageBanner';
import { JourneyPath } from '@/main/routing/urlResolver/UrlResolverProvider';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useSpaceAboutBaseQuery } from '@/core/apollo/generated/apollo-hooks';

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

  const { data: spaceData } = useSpaceAboutBaseQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId || loading,
  });

  const profile = spaceData?.lookup.space?.about.profile;

  const visual = getVisualByType(VisualName.BANNER, profile?.visuals);

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
          bannerUrl={visual?.uri}
          bannerAltText={visual?.alternativeText}
          ribbon={ribbon}
        />
      }
      tabsComponent={loading ? SpaceTabsSkeleton : SpaceTabs}
    >
      <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
        {children}
      </StorageConfigContextProvider>
    </EntityPageLayout>
  );
};

export default SpacePageLayout;

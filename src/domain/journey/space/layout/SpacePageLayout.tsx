import { EntityPageLayout } from '@/domain/journey/common/EntityPageLayout';
import SpaceTabs from './SpaceTabs';
import { PropsWithChildren } from 'react';
import { useSpace } from '../SpaceContext/useSpace';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import JourneyBreadcrumbs from '@/domain/journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';
import { getVisualByType } from '@/domain/common/visual/utils/visuals.utils';
import { VisualName } from '@/domain/common/visual/constants/visuals.constants';
import useInnovationHubJourneyBannerRibbon from '@/domain/innovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import SpacePageBanner from './SpacePageBanner';
import { JourneyPath } from '@/main/routing/urlResolver/UrlResolverProvider';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useSpaceProfileQuery } from '@/core/apollo/generated/apollo-hooks';
import useCanReadSpace from '@/domain/journey/space/graphql/queries/useCanReadSpace';
import useNavigate from '@/core/routing/useNavigate';
import { useLocation } from 'react-router-dom';

export interface SpacePageLayoutProps {
  currentSection: EntityPageSection;
  journeyPath: JourneyPath | undefined;
}

const SpacePageLayout = ({ currentSection, journeyPath, children }: PropsWithChildren<SpacePageLayoutProps>) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { spaceId, loading, about } = useSpace();

  const spaceReadAccess = useCanReadSpace({ spaceId });

  const { data: spaceData } = useSpaceProfileQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const profile = spaceData?.lookup.space?.about.profile;

  const visual = getVisualByType(VisualName.BANNER, profile?.visuals);

  const ribbon = useInnovationHubJourneyBannerRibbon({
    spaceId,
  });

  if (!loading && !spaceReadAccess.loading && !spaceReadAccess.canReadSpace && !pathname.includes('/about')) {
    navigate(`${about.profile.url}/about`);
  }

  return (
    <EntityPageLayout
      currentSection={currentSection}
      breadcrumbs={<JourneyBreadcrumbs journeyPath={journeyPath} />}
      pageBanner={
        <SpacePageBanner
          title={profile?.displayName}
          tagline={profile?.tagline}
          loading={loading}
          bannerUrl={visual?.uri}
          bannerAltText={visual?.alternativeText}
          ribbon={ribbon}
        />
      }
      tabsComponent={SpaceTabs}
    >
      <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
        {children}
      </StorageConfigContextProvider>
    </EntityPageLayout>
  );
};

export default SpacePageLayout;

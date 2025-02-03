import { EntityPageLayout } from '@/domain/journey/common/EntityPageLayout';
import SpaceTabs from './SpaceTabs';
import { PropsWithChildren } from 'react';
import { useSpace } from '../SpaceContext/useSpace';
import JourneyUnauthorizedDialogContainer from '@/domain/journey/common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialogContainer';
import JourneyUnauthorizedDialog from '@/domain/journey/common/JourneyUnauthorizedDialog/JourneyUnauthorizedDialog';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import JourneyBreadcrumbs from '@/domain/journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';
import { getVisualByType } from '@/domain/common/visual/utils/visuals.utils';
import { VisualName } from '@/domain/common/visual/constants/visuals.constants';
import useInnovationHubJourneyBannerRibbon from '@/domain/innovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import SpacePageBanner from './SpacePageBanner';
import CommunityGuidelinesBlock from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesBlock';
import { JourneyPath } from '@/main/routing/resolvers/RouteResolver';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useCanReadSpace from '@/domain/journey/common/authorization/useCanReadSpace';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export interface SpacePageLayoutProps {
  currentSection: EntityPageSection;
  unauthorizedDialogDisabled?: boolean;
  journeyPath: JourneyPath;
}

const SpacePageLayout = ({
  unauthorizedDialogDisabled = false,
  currentSection,
  journeyPath,
  children,
}: PropsWithChildren<SpacePageLayoutProps>) => {
  const { spaceId, communityId, profile, loading } = useSpace();

  const visual = getVisualByType(VisualName.BANNER, profile?.visuals);

  const ribbon = useInnovationHubJourneyBannerRibbon({
    spaceId,
    journeyTypeName: 'space',
  });

  const spaceReadAccess = useCanReadSpace({ spaceId });

  return (
    <EntityPageLayout
      currentSection={currentSection}
      breadcrumbs={<JourneyBreadcrumbs journeyPath={journeyPath} />}
      pageBanner={
        <SpacePageBanner
          title={profile.displayName}
          tagline={profile?.tagline}
          loading={loading}
          bannerUrl={visual?.uri}
          bannerAltText={visual?.alternativeText}
          ribbon={ribbon}
          journeyTypeName="space"
        />
      }
      tabsComponent={SpaceTabs}
    >
      <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
        {children}
      </StorageConfigContextProvider>
      <JourneyUnauthorizedDialogContainer {...spaceReadAccess} journeyId={spaceId}>
        {({ vision, ...props }) => (
          <JourneyUnauthorizedDialog
            description={vision}
            disabled={unauthorizedDialogDisabled}
            leftColumnChildrenTop={<CommunityGuidelinesBlock communityId={communityId} journeyUrl={profile.url} />}
            spaceLevel={SpaceLevel.L0}
            journeyId={spaceId}
            {...props}
          />
        )}
      </JourneyUnauthorizedDialogContainer>
    </EntityPageLayout>
  );
};

export default SpacePageLayout;

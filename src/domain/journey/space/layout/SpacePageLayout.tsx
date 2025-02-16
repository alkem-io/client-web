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
import { JourneyPath } from '@/main/routing/urlResolver/UrlResolverProvider';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useCanReadSpace from '@/domain/journey/common/authorization/useCanReadSpace';
import { SpaceAboutContextDetailsFragment, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useSpaceProfileQuery } from '@/core/apollo/generated/apollo-hooks';

export interface SpacePageLayoutProps {
  currentSection: EntityPageSection;
  unauthorizedDialogDisabled?: boolean;
  journeyPath: JourneyPath | undefined;
}

const SpacePageLayout = ({
  unauthorizedDialogDisabled = false,
  currentSection,
  journeyPath,
  children,
}: PropsWithChildren<SpacePageLayoutProps>) => {
  const { spaceId, communityId, loading } = useSpace();
  const { data: spaceData } = useSpaceProfileQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });
  const about: SpaceAboutContextDetailsFragment = spaceData?.lookup.space?.about!;
  const profile = spaceData?.lookup.space?.about.profile;

  const visual = getVisualByType(VisualName.BANNER, profile?.visuals);

  const ribbon = useInnovationHubJourneyBannerRibbon({
    spaceId,
  });

  const spaceReadAccess = useCanReadSpace({ spaceId });

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
      <JourneyUnauthorizedDialogContainer {...spaceReadAccess} journeyId={spaceId}>
        {({ ...props }) => (
          <JourneyUnauthorizedDialog
            about={about}
            disabled={unauthorizedDialogDisabled}
            leftColumnChildrenTop={<CommunityGuidelinesBlock communityId={communityId} journeyUrl={profile?.url} />}
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

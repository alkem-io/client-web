import { useState } from 'react';
import { useSpace } from '../SpaceContext/useSpace';
import { useBackWithDefaultUrl } from '@/core/routing/useBackToPath';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import ContributorsDialog from '@/domain/community/community/ContributorsDialog/ContributorsDialog';
import SubspaceContributorsDialogContent from '@/domain/community/community/entities/SubspaceContributorsDialogContent';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { EntityPageLayout } from '@/domain/journey/common/EntityPageLayout';
import JourneyBreadcrumbs from '@/domain/journey/common/journeyBreadcrumbs/JourneyBreadcrumbs';
import { SpaceTabsPlaceholder } from '../layout/TabbedSpaceL0/Tabs/SpaceTabs';
import SpacePageBanner from '@/domain/journey/space/layout/SpacePageBanner';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';

const SpaceAboutPage = () => {
  const { journeyPath } = useUrlResolver();
  const { space, permissions, loading: loadingSpace } = useSpace();
  const profile = space.about.profile;
  const { data, loading: loadingDetails } = useSpaceAboutDetailsQuery({
    variables: { spaceId: space.id },
    skip: !space.id,
  });
  const loading = loadingSpace || loadingDetails;
  const spaceDetails = data?.lookup.space;

  const backToParentPage = useBackWithDefaultUrl(permissions.canRead ? space.about.profile.url : undefined);

  const [isContributorsDialogOpen, setIsContributorsDialogOpen] = useState(false);

  return (
    <EntityPageLayout
      currentSection={EntityPageSection.About}
      breadcrumbs={<JourneyBreadcrumbs journeyPath={journeyPath} />}
      pageBanner={
        <SpacePageBanner
          title={profile?.displayName}
          tagline={profile?.tagline}
          loading={loading}
          bannerUrl={profile.banner?.uri}
        />
      }
      tabsComponent={SpaceTabsPlaceholder}
    >
      <StorageConfigContextProvider locationType="journey" spaceId={space.id}>
        {spaceDetails && (
          <SpaceAboutDialog
            open
            fullScreen
            space={spaceDetails}
            loading={loading}
            onClose={backToParentPage}
            hasReadPrivilege={permissions.canRead}
            hasEditPrivilege={permissions.canUpdate}
          />
        )}
        <ContributorsDialog
          open={isContributorsDialogOpen}
          onClose={() => setIsContributorsDialogOpen(false)}
          dialogContent={SubspaceContributorsDialogContent}
        />
      </StorageConfigContextProvider>
    </EntityPageLayout>
  );
};

export default SpaceAboutPage;

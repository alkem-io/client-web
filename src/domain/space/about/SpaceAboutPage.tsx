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

const SpaceAboutPage = () => {
  const { journeyPath } = useUrlResolver();
  const { space, permissions, loading } = useSpace();
  const profile = space.about.profile;
  const { about } = space;

  const backToParentPage = useBackWithDefaultUrl(permissions.canRead ? about.profile.url : '/home');

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
        <SpaceAboutDialog
          open
          space={space}
          loading={loading}
          onClose={backToParentPage}
          hasReadPrivilege={permissions.canRead}
          hasEditPrivilege={permissions.canUpdate}
        />
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

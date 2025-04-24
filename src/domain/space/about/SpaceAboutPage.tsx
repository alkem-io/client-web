import { useState } from 'react';
import { useSpace } from '../context/useSpace';
import { useBackWithDefaultUrl } from '@/core/routing/useBackToPath';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import ContributorsDialog from '@/domain/community/community/ContributorsDialog/ContributorsDialog';
import SubspaceContributorsDialogContent from '@/domain/community/community/entities/SubspaceContributorsDialogContent';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { EntityPageLayout } from '@/domain/space/layout/EntityPageLayout';
import SpaceBreadcrumbs from '@/domain/space/components/spaceBreadcrumbs/SpaceBreadcrumbs';
import { SpaceTabsPlaceholder } from '../layout/tabbedLayout/Tabs/SpaceTabs';
import SpacePageBanner from '@/domain/space/layout/tabbedLayout/layout/SpacePageBanner';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { Box } from '@mui/material';

const SpaceAboutPage = () => {
  const { spaceHierarchyPath } = useUrlResolver();
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
      breadcrumbs={<SpaceBreadcrumbs spaceHierarchyPath={spaceHierarchyPath} />}
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
      <Box sx={{ height: 'calc(100vh - 400px)' }}>&nbsp;</Box>
      <StorageConfigContextProvider locationType="journey" spaceId={space.id}>
        {spaceDetails && (
          <SpaceAboutDialog
            open
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

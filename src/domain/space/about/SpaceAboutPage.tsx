import { useState } from 'react';
import { useSpace } from '../context/useSpace';
import { useBackWithDefaultUrl } from '@/core/routing/useBackToPath';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import SpaceContributorsDialog from '@/domain/community/community/ContributorsDialog/SpaceContributorsDialog';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { Box } from '@mui/material';

const SpaceAboutPage = () => {
  const { space, permissions, loading: loadingSpace } = useSpace();
  const { data, loading: loadingDetails } = useSpaceAboutDetailsQuery({
    variables: { spaceId: space.id },
    skip: !space.id,
  });
  const loading = loadingSpace || loadingDetails;
  const spaceDetails = data?.lookup.space;

  const backToParentPage = useBackWithDefaultUrl(permissions.canRead ? space.about.profile.url : undefined);

  const [isContributorsDialogOpen, setIsContributorsDialogOpen] = useState(false);

  return (
    <>
      {/* sticky footer  */}
      <Box sx={{ height: 'calc(100vh - 400px)' }}>&nbsp;</Box>
      <StorageConfigContextProvider locationType="space" spaceId={space.id}>
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
        <SpaceContributorsDialog
          open={isContributorsDialogOpen}
          onClose={() => setIsContributorsDialogOpen(false)}
          roleSetId={spaceDetails?.about.membership.roleSetID}
        />
      </StorageConfigContextProvider>
    </>
  );
};

export default SpaceAboutPage;

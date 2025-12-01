import { useSpace } from '../context/useSpace';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { Box } from '@mui/material';
import useNavigate from '@/core/routing/useNavigate';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';

const SpaceAboutPage = () => {
  const navigate = useNavigate();
  const { space, permissions, loading: loadingSpace } = useSpace();
  const { data, loading: loadingDetails } = useSpaceAboutDetailsQuery({
    variables: { spaceId: space.id },
    skip: !space.id,
  });
  const loading = loadingSpace || loadingDetails;
  const spaceDetails = data?.lookup.space;

  const handleClose = () => navigate(permissions.canRead ? space.about.profile.url : `/${TopLevelRoutePath.Home}`);

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
            onClose={handleClose}
            hasReadPrivilege={permissions.canRead}
            hasEditPrivilege={permissions.canUpdate}
          />
        )}
      </StorageConfigContextProvider>
    </>
  );
};

export default SpaceAboutPage;

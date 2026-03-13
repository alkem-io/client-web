import { Box } from '@mui/material';
import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { useBackWithDefaultUrl } from '@/core/routing/useBackToPath';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useSpace } from '../context/useSpace';

const SpaceAboutPage = () => {
  const { space, permissions, loading: loadingSpace } = useSpace();
  const { data, loading: loadingDetails } = useSpaceAboutDetailsQuery({
    variables: { spaceId: space.id },
    skip: !space.id,
  });
  const loading = loadingSpace || loadingDetails;
  const spaceDetails = data?.lookup.space;

  const goBackPage = permissions.canRead ? space.about.profile.url : undefined;
  const goBackSteps = permissions.canRead ? undefined : 2;

  const backToParentPage = useBackWithDefaultUrl(goBackPage, goBackSteps);

  return (
    <>
      {/* sticky footer  */}
      <Box sx={{ height: 'calc(100vh - 400px)' }}>&nbsp;</Box>
      <StorageConfigContextProvider locationType="space" spaceId={space.id}>
        {spaceDetails && (
          <SpaceAboutDialog
            open={true}
            space={spaceDetails}
            loading={loading}
            onClose={backToParentPage}
            hasReadPrivilege={permissions.canRead}
            hasEditPrivilege={permissions.canUpdate}
          />
        )}
      </StorageConfigContextProvider>
    </>
  );
};

export default SpaceAboutPage;

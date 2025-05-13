import { useSubSpace } from '../hooks/useSubSpace';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import { SpaceDashboardSpaceDetails } from '../layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardView';
import useNavigate from '@/core/routing/useNavigate';
import { useSpace } from '../context/useSpace';
import { Box } from '@mui/material';

const SubspaceAboutPage = () => {
  const {
    space: {
      about: {
        profile: { url: parentSpaceUrl },
      },
    },
  } = useSpace();
  const { subspace, permissions, loading, parentSpaceId } = useSubSpace();
  const { about } = subspace;

  const space: SpaceDashboardSpaceDetails = {
    id: subspace.id,
    about: about,
    level: subspace.level,
  };

  // const backToParentPage = useBackWithDefaultUrl(permissions.canRead ? about.profile.url : undefined);

  const navigate = useNavigate();
  const handleClose = () => navigate(permissions.canRead ? about.profile.url : parentSpaceUrl);
  return (
    <>
      {/* sticky footer  */}
      <Box sx={{ height: 'calc(100vh - 400px)' }}>&nbsp;</Box>
      <SpaceAboutDialog
        open
        space={space}
        parentSpaceId={parentSpaceId}
        loading={loading}
        onClose={handleClose}
        hasReadPrivilege={permissions.canRead}
        hasEditPrivilege={permissions.canUpdate}
      />
    </>
  );
};

export default SubspaceAboutPage;

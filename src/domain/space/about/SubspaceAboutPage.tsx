import { useState } from 'react';
import { useSubSpace } from '../hooks/useSubSpace';
import { useBackWithDefaultUrl } from '@/core/routing/useBackToPath';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import ContributorsDialog from '@/domain/community/community/ContributorsDialog/ContributorsDialog';
import SubspaceContributorsDialogContent from '@/domain/community/community/entities/SubspaceContributorsDialogContent';
import { SpaceDashboardSpaceDetails } from '../layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardView';

const SubspaceAboutPage = () => {
  const { subspace, permissions, loading, parentSpaceId } = useSubSpace();
  const { about } = subspace;

  const [isContributorsDialogOpen, setIsContributorsDialogOpen] = useState(false);

  const space: SpaceDashboardSpaceDetails = {
    id: subspace.id,
    about: about,
    level: subspace.level,
  };

  const backToParentPage = useBackWithDefaultUrl(permissions.canRead ? about.profile.url : undefined);

  return (
    <>
      <SpaceAboutDialog
        open
        space={space}
        parentSpaceId={parentSpaceId}
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
    </>
  );
};

export default SubspaceAboutPage;

import { useState } from 'react';
import { useSubSpace } from '../../journey/subspace/hooks/useSubSpace';
import { useBackWithDefaultUrl } from '@/core/routing/useBackToPath';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import ContributorsDialog from '@/domain/community/community/ContributorsDialog/ContributorsDialog';
import SubspaceContributorsDialogContent from '@/domain/community/community/entities/SubspaceContributorsDialogContent';
import { SpaceDashboardSpaceDetails } from '../layout/TabbedSpaceL0/Tabs/SpaceDashboard/SpaceDashboardView';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

const SubspaceAboutPage = () => {
  const { subspace, loading } = useSubSpace();
  const { about } = subspace;

  const [isContributorsDialogOpen, setIsContributorsDialogOpen] = useState(false);

  const space: SpaceDashboardSpaceDetails = {
    id: subspace.id,
    about: about,
    level: subspace.level,
  };

  const spacePrivileges = subspace.authorization?.myPrivileges || [];
  const canReadSpace = spacePrivileges.includes(AuthorizationPrivilege.Read);
  const canUpdateSpace = spacePrivileges.includes(AuthorizationPrivilege.Update);

  const backToParentPage = useBackWithDefaultUrl(canReadSpace ? about.profile.url : undefined);

  return (
    <>
      <SpaceAboutDialog
        open
        space={space}
        loading={loading}
        onClose={backToParentPage}
        hasReadPrivilege={canReadSpace}
        hasEditPrivilege={canUpdateSpace}
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

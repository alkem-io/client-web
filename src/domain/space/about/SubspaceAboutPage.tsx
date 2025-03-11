import { useState } from 'react';
import { useSubSpace } from '../../journey/subspace/hooks/useSubSpace';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import ContributorsDialog from '@/domain/community/community/ContributorsDialog/ContributorsDialog';
import SubspaceContributorsDialogContent from '@/domain/community/community/entities/SubspaceContributorsDialogContent';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { SpaceDashboardSpaceDetails } from '../layout/TabbedSpaceL0/Tabs/SpaceDashboard/SpaceDashboardView';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

const SubspaceAboutPage = () => {
  const { spaceId } = useUrlResolver();
  const { subspace, loading } = useSubSpace();
  const { about } = subspace;
  const backToParentPage = useBackToStaticPath(about.profile.url);

  const [isContributorsDialogOpen, setIsContributorsDialogOpen] = useState(false);

  const space: SpaceDashboardSpaceDetails = {
    id: spaceId,
    about: about,
    level: subspace.level,
  };

  const spacePrivileges = subspace.authorization?.myPrivileges || [];
  const canReadSpace = spacePrivileges.includes(AuthorizationPrivilege.Read);
  const canUpdateSpace = spacePrivileges.includes(AuthorizationPrivilege.Update);

  return (
    <>
      <SpaceAboutDialog
        open
        space={space}
        loading={loading}
        onClose={canReadSpace ? backToParentPage : undefined}
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

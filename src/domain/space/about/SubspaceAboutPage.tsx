import { useState } from 'react';
import { useSubSpace } from '../../journey/subspace/hooks/useSubSpace';
import AboutPageContainer from '@/domain/space/about/SpaceAboutPageContainer';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import useSendMessageToCommunityLeads from '@/domain/community/CommunityLeads/useSendMessageToCommunityLeads';
import ContributorsDialog from '@/domain/community/community/ContributorsDialog/ContributorsDialog';
import SubspaceContributorsDialogContent from '@/domain/community/community/entities/SubspaceContributorsDialogContent';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { SpaceDashboardSpaceDetails } from '../layout/TabbedSpaceL0/Tabs/SpaceDashboard/SpaceDashboardView';

const SubspaceAboutPage = () => {
  const { spaceId } = useUrlResolver();
  const { subspace } = useSubSpace();
  const { about } = subspace;
  const communityId = about.membership.communityID;

  const backToParentPage = useBackToStaticPath(about.profile.url);

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const [isContributorsDialogOpen, setIsContributorsDialogOpen] = useState(false);

  const space2: SpaceDashboardSpaceDetails = {
    id: spaceId,
    about: about,
    level: subspace.level,
  };

  return (
    <>
      <AboutPageContainer journeyId={spaceId}>
        {({ hasReadPrivilege, hasEditPrivilege }, state) => (
          <SpaceAboutDialog
            open
            space={space2}
            sendMessageToCommunityLeads={sendMessageToCommunityLeads}
            loading={state.loading}
            onClose={hasReadPrivilege ? backToParentPage : undefined}
            hasReadPrivilege={hasReadPrivilege}
            hasEditPrivilege={hasEditPrivilege}
          />
        )}
      </AboutPageContainer>
      <ContributorsDialog
        open={isContributorsDialogOpen}
        onClose={() => setIsContributorsDialogOpen(false)}
        dialogContent={SubspaceContributorsDialogContent}
      />
    </>
  );
};

export default SubspaceAboutPage;

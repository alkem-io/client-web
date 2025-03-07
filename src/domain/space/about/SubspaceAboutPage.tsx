import { useState } from 'react';
import { useSubSpace } from '../../journey/subspace/hooks/useSubSpace';
import AboutPageContainer from '@/domain/space/about/SpaceAboutPageContainer';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import useSendMessageToCommunityLeads from '@/domain/community/CommunityLeads/useSendMessageToCommunityLeads';
import ContributorsDialog from '@/domain/community/community/ContributorsDialog/ContributorsDialog';
import SubspaceContributorsDialogContent from '@/domain/community/community/entities/SubspaceContributorsDialogContent';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

const SubspaceAboutPage = () => {
  const { spaceId, parentSpaceId, spaceLevel } = useUrlResolver();
  const { communityId, about } = useSubSpace();

  const backToParentPage = useBackToStaticPath(about.profile.url);

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const [isContributorsDialogOpen, setIsContributorsDialogOpen] = useState(false);

  return (
    <>
      <AboutPageContainer journeyId={spaceId}>
        {({ about, provider, leadOrganizations, leadUsers, metrics, hasReadPrivilege, hasEditPrivilege }, state) => (
          <SpaceAboutDialog
            open
            spaceId={spaceId}
            spaceLevel={spaceLevel}
            parentSpaceId={parentSpaceId}
            about={about}
            sendMessageToCommunityLeads={sendMessageToCommunityLeads}
            metrics={metrics}
            communityId={communityId}
            loading={state.loading}
            leadUsers={leadUsers}
            provider={provider}
            leadOrganizations={leadOrganizations}
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

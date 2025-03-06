import { useState } from 'react';
import { useSubSpace } from '../../journey/subspace/hooks/useSubSpace';
import AboutPageContainer from '@/domain/space/about/SpaceAboutPageContainer';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import SpaceAboutDialog from '@/domain/space/about/SpaceAboutDialog';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import useSendMessageToCommunityLeads from '@/domain/community/CommunityLeads/useSendMessageToCommunityLeads';
import EntityDashboardContributorsSection from '@/domain/community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import ContributorsDialog from '@/domain/community/community/ContributorsDialog/ContributorsDialog';
import SubspaceContributorsDialogContent from '@/domain/community/community/entities/SubspaceContributorsDialogContent';
import SeeMore from '@/core/ui/content/SeeMore';
import { useTranslation } from 'react-i18next';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import CommunityGuidelinesBlock from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesBlock';

const SubspaceAboutPage = () => {
  const { spaceId, spaceLevel } = useUrlResolver();
  const { communityId, about } = useSubSpace();

  const backToParentPage = useBackToStaticPath(about.profile.url);

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const [isContributorsDialogOpen, setIsContributorsDialogOpen] = useState(false);

  const { t } = useTranslation();

  return (
    <>
      <AboutPageContainer journeyId={spaceId}>
        {(
          {
            about,
            provider,
            leadOrganizations,
            leadUsers,
            metrics,
            memberUsers,
            memberUsersCount,
            memberOrganizations,
            memberOrganizationsCount,
            virtualContributors,
            hasReadPrivilege,
          },
          state
        ) => (
          <SpaceAboutDialog
            open
            spaceLevel={spaceLevel}
            about={about}
            sendMessageToCommunityLeads={sendMessageToCommunityLeads}
            metrics={metrics}
            guidelines={<CommunityGuidelinesBlock communityId={communityId} journeyUrl={about?.profile?.url} />}
            loading={state.loading}
            leadUsers={leadUsers}
            provider={provider}
            leadOrganizations={leadOrganizations}
            endButton={
              <IconButton onClick={backToParentPage} aria-label={t('buttons.close')}>
                <Close />
              </IconButton>
            }
            leftColumnChildrenBottom={
              hasReadPrivilege && (
                <EntityDashboardContributorsSection
                  memberUsers={memberUsers}
                  memberUsersCount={memberUsersCount}
                  memberOrganizations={memberOrganizations}
                  memberOrganizationsCount={memberOrganizationsCount}
                >
                  <SeeMore subject={t('common.contributors')} onClick={() => setIsContributorsDialogOpen(true)} />
                </EntityDashboardContributorsSection>
              )
            }
            virtualContributors={virtualContributors}
            hasReadPrivilege={hasReadPrivilege}
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

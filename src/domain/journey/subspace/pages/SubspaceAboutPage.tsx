import { useState } from 'react';
import { useSubSpace } from '../hooks/useSubSpace';
import AboutPageContainer from '@/domain/journey/space/about/AboutPageContainer';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import JourneyAboutDialog from '@/domain/journey/common/JourneyAboutDialog/JourneyAboutDialog';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import useSendMessageToCommunityLeads from '@/domain/community/CommunityLeads/useSendMessageToCommunityLeads';
import EntityDashboardContributorsSection from '@/domain/community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import ContributorsDialog from '@/domain/community/community/ContributorsDialog/ContributorsDialog';
import SubspaceContributorsDialogContent from '@/domain/community/community/entities/SubspaceContributorsDialogContent';
import SeeMore from '@/core/ui/content/SeeMore';
import { useTranslation } from 'react-i18next';
import { buildAboutUrl } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import CommunityGuidelinesBlock from '@/domain/community/community/CommunityGuidelines/CommunityGuidelinesBlock';

const SubspaceAboutPage = () => {
  const { spaceId, spaceLevel } = useUrlResolver();
  const { communityId, about: profile } = useSubSpace();

  const backToParentPage = useBackToStaticPath(profile.url);

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const [isContributorsDialogOpen, setIsContributorsDialogOpen] = useState(false);

  const { t } = useTranslation();

  return (
    <>
      <AboutPageContainer journeyId={spaceId}>
        {(
          {
            context,
            references,
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
          <JourneyAboutDialog
            open
            spaceLevel={spaceLevel}
            displayName={profile?.displayName}
            tagline={profile?.tagline}
            references={references}
            sendMessageToCommunityLeads={sendMessageToCommunityLeads}
            metrics={metrics}
            description={context?.why}
            background={profile?.description}
            who={context?.who}
            when={context?.impact}
            guidelines={<CommunityGuidelinesBlock communityId={communityId} journeyUrl={profile.url} />}
            loading={state.loading}
            leadUsers={leadUsers}
            provider={provider}
            leadOrganizations={leadOrganizations}
            endButton={
              <IconButton onClick={backToParentPage} aria-label={t('buttons.close')}>
                <Close />
              </IconButton>
            }
            shareUrl={buildAboutUrl(profile.url)}
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

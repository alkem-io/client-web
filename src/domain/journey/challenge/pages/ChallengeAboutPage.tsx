import React, { FC, useState } from 'react';
import { useChallenge } from '../hooks/useChallenge';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import ChallengeDashboardPage from './ChallengeDashboardPage';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import JourneyAboutDialog from '../../common/JourneyAboutDialog/JourneyAboutDialog';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import useSendMessageToCommunityLeads from '../../../community/CommunityLeads/useSendMessageToCommunityLeads';
import EntityDashboardContributorsSection from '../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';
import ContributorsDialog from '../../../community/community/ContributorsDialog/ContributorsDialog';
import ChallengeContributorsDialogContent from '../../../community/community/entities/ChallengeContributorsDialogContent';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { useTranslation } from 'react-i18next';
import { buildAboutUrl } from '../../../../main/routing/urlBuilders';

const ChallengeAboutPage: FC = () => {
  const { spaceNameId, profile, challengeNameId, communityId } = useChallenge();

  const [backToParentPage] = useBackToParentPage('../dashboard');

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const [isContributorsDialogOpen, setIsContributorsDialogOpen] = useState(false);

  const { t } = useTranslation();

  const shareAboutUrl = buildAboutUrl({ spaceNameId });

  return (
    <>
      <ChallengeDashboardPage />
      <AboutPageContainer spaceNameId={spaceNameId} challengeNameId={challengeNameId}>
        {(
          {
            context,
            references,
            hostOrganization,
            leadOrganizations,
            leadUsers,
            metrics,
            memberUsers,
            memberUsersCount,
            memberOrganizations,
            memberOrganizationsCount,
          },
          state
        ) => (
          <JourneyAboutDialog
            open
            journeyTypeName="challenge"
            displayName={profile?.displayName}
            tagline={profile?.tagline}
            references={references}
            sendMessageToCommunityLeads={sendMessageToCommunityLeads}
            metrics={metrics}
            description={context?.vision}
            background={profile?.description}
            who={context?.who}
            impact={context?.impact}
            loading={state.loading}
            leadUsers={leadUsers}
            hostOrganizations={hostOrganization && [hostOrganization]}
            leadOrganizations={leadOrganizations}
            endButton={
              <IconButton onClick={backToParentPage}>
                <Close />
              </IconButton>
            }
            shareUrl={shareAboutUrl}
            leftColumnChildren={
              <EntityDashboardContributorsSection
                memberUsers={memberUsers}
                memberUsersCount={memberUsersCount}
                memberOrganizations={memberOrganizations}
                memberOrganizationsCount={memberOrganizationsCount}
              >
                <SeeMore subject={t('common.contributors')} onClick={() => setIsContributorsDialogOpen(true)} />
              </EntityDashboardContributorsSection>
            }
          />
        )}
      </AboutPageContainer>
      <ContributorsDialog
        open={isContributorsDialogOpen}
        onClose={() => setIsContributorsDialogOpen(false)}
        dialogContent={ChallengeContributorsDialogContent}
      />
    </>
  );
};

export default ChallengeAboutPage;

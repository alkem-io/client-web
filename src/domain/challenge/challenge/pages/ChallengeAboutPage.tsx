import React, { FC } from 'react';
import { useChallenge } from '../hooks/useChallenge';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import ChallengeDashboardPage from './ChallengeDashboardPage';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import JourneyAboutDialog from '../../common/JourneyAboutDialog/JourneyAboutDialog';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import useSendMessageToCommunityLeads from '../../../community/CommunityLeads/useSendMessageToCommunityLeads';
import EntityDashboardContributorsSection from '../../../community/community/EntityDashboardContributorsSection/EntityDashboardContributorsSection';

const ChallengeAboutPage: FC = () => {
  const { spaceNameId, profile, challengeNameId, communityId } = useChallenge();

  const [backToParentPage] = useBackToParentPage('../dashboard');

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

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
            leftColumnChildren={
              <EntityDashboardContributorsSection
                memberUsers={memberUsers}
                memberUsersCount={memberUsersCount}
                memberOrganizations={memberOrganizations}
                memberOrganizationsCount={memberOrganizationsCount}
              />
            }
          />
        )}
      </AboutPageContainer>
    </>
  );
};

export default ChallengeAboutPage;

import React, { FC, useState } from 'react';
import { useSubSpace } from '../hooks/useChallenge';
import AboutPageContainer from '../../common/AboutPageContainer/AboutPageContainer';
import { useBackToStaticPath } from '../../../../core/routing/useBackToPath';
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
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import CommunityGuidelinesBlock from '../../../community/community/CommunityGuidelines/CommunityGuidelinesBlock';

const SubspaceAboutPage: FC = () => {
  const { communityId, profile } = useSubSpace();

  const backToParentPage = useBackToStaticPath(profile.url);

  const sendMessageToCommunityLeads = useSendMessageToCommunityLeads(communityId);

  const [isContributorsDialogOpen, setIsContributorsDialogOpen] = useState(false);

  const { t } = useTranslation();

  const { journeyId, journeyLevel } = useRouteResolver();

  return (
    <>
      <AboutPageContainer journeyId={journeyId}>
        {(
          {
            context,
            references,
            host,
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
            journeyLevel={journeyLevel}
            displayName={profile?.displayName}
            tagline={profile?.tagline}
            references={references}
            sendMessageToCommunityLeads={sendMessageToCommunityLeads}
            metrics={metrics}
            description={context?.vision}
            background={profile?.description}
            who={context?.who}
            impact={context?.impact}
            guidelines={<CommunityGuidelinesBlock communityId={communityId} journeyUrl={profile.url} />}
            loading={state.loading}
            leadUsers={leadUsers}
            host={host}
            leadOrganizations={leadOrganizations}
            endButton={
              <IconButton onClick={backToParentPage} aria-label={t('buttons.close')}>
                <Close />
              </IconButton>
            }
            shareUrl={buildAboutUrl(profile.url)}
            leftColumnChildrenBottom={
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

export default SubspaceAboutPage;

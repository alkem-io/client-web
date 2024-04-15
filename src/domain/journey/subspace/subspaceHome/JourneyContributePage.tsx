import React from 'react';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import SubspaceHomeView from './SubspaceHomeView';
import JourneyContributePageContainer from './JourneyContributePageContainer';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import { useTranslation } from 'react-i18next';
import { SubspacePageLayout } from '../../common/EntityPageLayout';
import JourneyDashboardWelcomeBlock from '../../common/journeyDashboardWelcomeBlock/JourneyDashboardWelcomeBlock';
import { CommunityMembershipStatus } from '../../../../core/apollo/generated/graphql-schema';

const JourneyContributePage = () => {
  const { t } = useTranslation();

  const { journeyId, journeyTypeName } = useRouteResolver();

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  return (
    <JourneyContributePageContainer journeyId={journeyId} journeyTypeName={journeyTypeName}>
      {({ innovationFlowStates, callouts, subspace }) => (
        <SubspacePageLayout
          currentSection={EntityPageSection.Contribute}
          welcome={
            <JourneyDashboardWelcomeBlock
              vision={subspace?.context?.vision ?? ''}
              leadUsers={subspace?.community?.leadUsers}
              onContactLeadUser={receiver => sendMessage('user', receiver)}
              leadOrganizations={subspace?.community?.leadOrganizations}
              onContactLeadOrganization={receiver => sendMessage('organization', receiver)}
              journeyTypeName="subspace"
              member={subspace?.community?.myMembershipStatus === CommunityMembershipStatus.Member}
            />
          }
          profile={subspace?.profile}
        >
          <SubspaceHomeView
            journeyTypeName={journeyTypeName}
            {...innovationFlowStates}
            {...callouts}
            collaborationId={subspace?.collaboration.id}
          />
          {directMessageDialog}
        </SubspacePageLayout>
      )}
    </JourneyContributePageContainer>
  );
};

export default JourneyContributePage;

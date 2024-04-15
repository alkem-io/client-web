import React from 'react';
import usePageLayoutByEntity from '../../../shared/utils/usePageLayoutByEntity';
import { JourneyTypeName } from '../../JourneyTypeName';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import SubspaceHomeView from './SubspaceHomeView';
import JourneyContributePageContainer from './JourneyContributePageContainer';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import { useTranslation } from 'react-i18next';
import useSpaceDashboardNavigation from '../../space/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSpace } from '../../space/SpaceContext/useSpace';

interface ContributePageProps {
  journeyTypeName: JourneyTypeName;
}

const JourneyContributePage = ({ journeyTypeName }: ContributePageProps) => {
  const PageLayout = usePageLayoutByEntity(journeyTypeName);

  const { t } = useTranslation();

  const { spaceId, profile: spaceProfile } = useSpace();

  const { journeyId, loading: resolvingRoute } = useRouteResolver();

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const { dashboardNavigation } = useSpaceDashboardNavigation({
    spaceId,
    skip: resolvingRoute,
  });

  return (
    <PageLayout currentSection={EntityPageSection.Contribute}>
      <JourneyContributePageContainer journeyId={journeyId} journeyTypeName={journeyTypeName}>
        {({ innovationFlowStates, callouts, subspace }) => (
          <SubspaceHomeView
            journeyId={journeyId}
            journeyTypeName={journeyTypeName}
            {...innovationFlowStates}
            {...callouts}
            collaborationId={subspace?.collaboration.id}
            sendMessage={sendMessage}
            community={subspace?.community}
            context={subspace?.context}
            dashboardNavigation={dashboardNavigation}
            spaceUrl={spaceProfile.url}
            spaceDisplayName={spaceProfile.displayName}
          />
        )}
      </JourneyContributePageContainer>
      {directMessageDialog}
    </PageLayout>
  );
};

export default JourneyContributePage;

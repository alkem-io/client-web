import React from 'react';
import usePageLayoutByEntity from '../../../shared/utils/usePageLayoutByEntity';
import { JourneyTypeName } from '../../JourneyTypeName';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import JourneyCalloutsTabView from '../../../collaboration/callout/JourneyCalloutsTabView/JourneyCalloutsTabView';
import JourneyContributePageContainer from './JourneyContributePageContainer';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';

interface ContributePageProps {
  journeyTypeName: JourneyTypeName;
}

const JourneyContributePage = ({ journeyTypeName }: ContributePageProps) => {
  const PageLayout = usePageLayoutByEntity(journeyTypeName);

  const { journeyId } = useRouteResolver();

  return (
    <PageLayout currentSection={EntityPageSection.Contribute}>
      <JourneyContributePageContainer journeyId={journeyId} journeyTypeName={journeyTypeName}>
        {({ innovationFlowStates, callouts, collaborationId }) => (
          <JourneyCalloutsTabView
            journeyTypeName={journeyTypeName}
            {...innovationFlowStates}
            {...callouts}
            collaborationId={collaborationId}
          />
        )}
      </JourneyContributePageContainer>
    </PageLayout>
  );
};

export default JourneyContributePage;

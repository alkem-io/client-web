import React from 'react';
import usePageLayoutByEntity from '../../../shared/utils/usePageLayoutByEntity';
import { JourneyTypeName } from '../../JourneyTypeName';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import SubspaceHomeView from '../../subspace/subspaceHome/SubspaceHomeView';
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
          <SubspaceHomeView
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

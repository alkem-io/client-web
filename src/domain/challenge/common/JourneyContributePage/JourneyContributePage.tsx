import React from 'react';
import usePageLayoutByEntity from '../../../shared/utils/usePageLayoutByEntity';
import { JourneyTypeName } from '../../JourneyTypeName';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import JourneyCalloutsTabView from '../../../collaboration/callout/JourneyCalloutsTabView/JourneyCalloutsTabView';
import JourneyContributePageContainer from './JourneyContributePageContainer';

interface ContributePageProps {
  journeyTypeName: JourneyTypeName;
  scrollToCallout?: boolean;
}

const JourneyContributePage = ({ journeyTypeName, scrollToCallout = false }: ContributePageProps) => {
  const PageLayout = usePageLayoutByEntity(journeyTypeName);

  return (
    <PageLayout currentSection={EntityPageSection.Contribute}>
      <JourneyContributePageContainer>
        {({ innovationFlowStates, callouts, spaceNameId, challengeNameId, opportunityNameId }) => (
          <JourneyCalloutsTabView
            scrollToCallout={scrollToCallout}
            journeyTypeName={journeyTypeName}
            {...innovationFlowStates}
            {...callouts}
            spaceNameId={spaceNameId}
            challengeNameId={challengeNameId}
            opportunityNameId={opportunityNameId}
          />
        )}
      </JourneyContributePageContainer>
    </PageLayout>
  );
};

export default JourneyContributePage;

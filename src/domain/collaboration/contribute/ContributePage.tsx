import React from 'react';
import usePageLayoutByEntity from '../../shared/utils/usePageLayoutByEntity';
import { JourneyTypeName } from '../../challenge/JourneyTypeName';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import JourneyCalloutsTabView from '../callout/JourneyCalloutsTabView/JourneyCalloutsTabView';

interface ContributePageProps {
  journeyTypeName: JourneyTypeName;
  scrollToCallout?: boolean;
}

const ContributePage = ({ journeyTypeName, scrollToCallout = false }: ContributePageProps) => {
  const PageLayout = usePageLayoutByEntity(journeyTypeName);

  return (
    <PageLayout currentSection={EntityPageSection.Contribute}>
      <JourneyCalloutsTabView scrollToCallout={scrollToCallout} journeyTypeName={journeyTypeName} />
    </PageLayout>
  );
};

export default ContributePage;

import React, { PropsWithChildren } from 'react';
import usePageLayoutByEntity from '../../shared/utils/usePageLayoutByEntity';
import { JourneyTypeName } from '../../challenge/JourneyTypeName';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import JourneyCalloutsGroupTabView from '../callout/CalloutsInContext/JourneyCalloutsGroupTabView';

interface KnowledgeBasePageProps {
  journeyTypeName: JourneyTypeName;
  scrollToCallout?: boolean;
}

const KnowledgeBasePage = ({
  journeyTypeName,
  scrollToCallout = false,
  children,
}: PropsWithChildren<KnowledgeBasePageProps>) => {
  const PageLayout = usePageLayoutByEntity(journeyTypeName);

  return (
    <>
      <PageLayout currentSection={EntityPageSection.KnowledgeBase}>
        <JourneyCalloutsGroupTabView scrollToCallout={scrollToCallout} entityTypeName={journeyTypeName} />
      </PageLayout>
      {children}
    </>
  );
};

export default KnowledgeBasePage;

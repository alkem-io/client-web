import React, { PropsWithChildren } from 'react';
import usePageLayoutByEntity from '../../shared/utils/usePageLayoutByEntity';
import { EntityTypeName } from '../../shared/layout/PageLayout/SimplePageLayout';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import CalloutsView from './CalloutsView';

interface CalloutsPageProps {
  entityTypeName: EntityTypeName;
  rootUrl: string;
  scrollToCallout?: boolean;
}

const CalloutsPage = ({
  entityTypeName,
  rootUrl,
  scrollToCallout = false,
  children,
}: PropsWithChildren<CalloutsPageProps>) => {
  const PageLayout = usePageLayoutByEntity(entityTypeName);

  return (
    <>
      <PageLayout currentSection={EntityPageSection.Explore}>
        <CalloutsView rootUrl={rootUrl} scrollToCallout={scrollToCallout} />
      </PageLayout>
      {children}
    </>
  );
};

export default CalloutsPage;

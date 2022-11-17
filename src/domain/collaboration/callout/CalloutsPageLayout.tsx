import React, { FC } from 'react';
import usePageLayoutByEntity from '../../shared/utils/usePageLayoutByEntity';
import { EntityTypeName } from '../../shared/layout/PageLayout/SimplePageLayout';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import CalloutsPage from './CalloutsPage';

interface CalloutsPageLayoutProps {
  entityTypeName: EntityTypeName;
  rootUrl: string;
  scrollToCallout?: boolean;
}

const CalloutsPageLayout: FC<CalloutsPageLayoutProps> = ({
  entityTypeName,
  rootUrl,
  scrollToCallout = false,
  children,
}) => {
  const PageLayout = usePageLayoutByEntity(entityTypeName);

  return (
    <>
      <PageLayout currentSection={EntityPageSection.Explore}>
        <CalloutsPage rootUrl={rootUrl} scrollToCallout={scrollToCallout} />
      </PageLayout>
      {children}
    </>
  );
};

export default CalloutsPageLayout;

import React, { PropsWithChildren } from 'react';
import usePageLayoutByEntity from '../../shared/utils/usePageLayoutByEntity';
import { EntityTypeName } from '../../shared/layout/PageLayout/SimplePageLayout';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import CalloutsView from '../callout/CalloutsView/CalloutsView';

interface ContributePageProps {
  entityTypeName: EntityTypeName;
  rootUrl: string;
  scrollToCallout?: boolean;
}

const ContributePage = ({
  entityTypeName,
  rootUrl,
  scrollToCallout = false,
  children,
}: PropsWithChildren<ContributePageProps>) => {
  const PageLayout = usePageLayoutByEntity(entityTypeName);

  return (
    <>
      <PageLayout currentSection={EntityPageSection.Contribute}>
        <CalloutsView rootUrl={rootUrl} scrollToCallout={scrollToCallout} />
      </PageLayout>
      {children}
    </>
  );
};

export default ContributePage;

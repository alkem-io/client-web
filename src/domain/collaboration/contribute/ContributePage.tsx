import React, { PropsWithChildren } from 'react';
import usePageLayoutByEntity from '../../shared/utils/usePageLayoutByEntity';
import { EntityTypeName } from '../../shared/layout/LegacyPageLayout/SimplePageLayout';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import CalloutsView from '../callout/CalloutsView/CalloutsView';

interface ContributePageProps {
  entityTypeName: EntityTypeName;
  scrollToCallout?: boolean;
}

const ContributePage = ({
  entityTypeName,
  scrollToCallout = false,
  children,
}: PropsWithChildren<ContributePageProps>) => {
  const PageLayout = usePageLayoutByEntity(entityTypeName);

  return (
    <>
      <PageLayout currentSection={EntityPageSection.Contribute}>
        <CalloutsView scrollToCallout={scrollToCallout} entityTypeName={entityTypeName} />
      </PageLayout>
      {children}
    </>
  );
};

export default ContributePage;

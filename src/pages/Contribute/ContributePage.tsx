import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useUpdateNavigation, useUrlParams } from '../../hooks';
import ContributeTabContainer from '../../containers/ContributeTabContainer/ContributeTabContainer';
import ContributeView from '../../views/ContributeView/ContributeView';
import PageLayout from '../../domain/shared/layout/PageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import { EntityTypeName } from '../../domain/shared/layout/PageLayout/PageLayout';

interface ContributePageProps extends PageProps {
  entityTypeName: EntityTypeName;
}

const ContributePage: FC<ContributePageProps> = ({ entityTypeName, paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/contribute', name: 'contribute', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { hubNameId, challengeNameId, opportunityNameId } = useUrlParams();

  if (!hubNameId) {
    return <></>;
  }

  return (
    <PageLayout currentSection={EntityPageSection.Contribute} entityTypeName={entityTypeName}>
      <ContributeTabContainer
        hubNameId={hubNameId}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
        component={ContributeView}
      />
    </PageLayout>
  );
};

export default ContributePage;

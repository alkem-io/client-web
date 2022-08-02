import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useUpdateNavigation, useUrlParams } from '../../hooks';
import ContributeTabContainer from '../../containers/ContributeTabContainer/ContributeTabContainer';
import ContributeView from '../../views/ContributeView/ContributeView';
import HubPageLayout from '../../domain/hub/layout/HubPageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import { EntityTypeName } from '../../domain/shared/layout/PageLayout/SimplePageLayout';
import ChallengePageLayout from '../../domain/challenge/layout/ChallengePageLayout';
import OpportunityPageLayout from '../../domain/opportunity/layout/OpportunityPageLayout';

interface ContributePageProps extends PageProps {
  entityTypeName: EntityTypeName;
}

const ContributePage: FC<ContributePageProps> = ({ entityTypeName, paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/contribute', name: 'contribute', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { hubNameId, challengeNameId, opportunityNameId } = useUrlParams();

  const PageLayout = useMemo(() => {
    switch (entityTypeName) {
      case 'hub':
        return HubPageLayout;
      case 'challenge':
        return ChallengePageLayout;
      case 'opportunity':
        return OpportunityPageLayout;
    }
    throw new TypeError(`Unknown entity ${entityTypeName}`);
  }, [entityTypeName]);

  if (!hubNameId) {
    return <></>;
  }

  return (
    <PageLayout currentSection={EntityPageSection.Explore} entityTypeName={entityTypeName}>
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

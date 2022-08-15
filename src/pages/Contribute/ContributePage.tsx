import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../hooks';
import ContributeTabContainer from '../../containers/ContributeTabContainer/ContributeTabContainer';
import ContributeView from '../../views/ContributeView/ContributeView';
import HubPageLayout from '../../domain/hub/layout/HubPageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import { EntityTypeName } from '../../domain/shared/layout/PageLayout/SimplePageLayout';
import ChallengePageLayout from '../../domain/challenge/layout/ChallengePageLayout';
import OpportunityPageLayout from '../../domain/opportunity/layout/OpportunityPageLayout';
import CanvasesView from '../../domain/canvas/EntityCanvasPage/CanvasesView';
import { useResolvedPath } from 'react-router-dom';
import { SectionSpacer } from '../../domain/shared/components/Section/Section';

interface ContributePageProps {
  entityTypeName: EntityTypeName;
}

const ContributePage: FC<ContributePageProps> = ({ entityTypeName }) => {
  const { hubNameId, challengeNameId, opportunityNameId, canvasId } = useUrlParams();

  const currentPath = useResolvedPath(canvasId ? '..' : '.');

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
    <PageLayout currentSection={EntityPageSection.Explore}>
      <CanvasesView canvasId={canvasId} parentUrl={currentPath.pathname} entityTypeName={entityTypeName} />
      <SectionSpacer />
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

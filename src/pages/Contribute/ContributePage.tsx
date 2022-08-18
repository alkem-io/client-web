import React, { FC, useCallback, useMemo, useState } from 'react';
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
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import CalloutCreationDialog from '../../domain/callout/creation-dialog/CalloutCreationDialog';

interface ContributePageProps {
  entityTypeName: EntityTypeName;
}

const ContributePage: FC<ContributePageProps> = ({ entityTypeName }) => {
  const { t }  = useTranslation();
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

  const [isCalloutCreationDialogOpen, setIsCalloutCreationDialogOpen] = useState(true);
  const handleCreateCalloutOpened = useCallback(() => setIsCalloutCreationDialogOpen(true), []);
  const handleCreateCalloutClosed = useCallback(() => setIsCalloutCreationDialogOpen(false), []);
  const handleCreateCalloutCreated = useCallback(async () => { return undefined; }, []);

  if (!hubNameId) {
    return <></>;
  }

  return (
    <>
      <PageLayout currentSection={EntityPageSection.Explore}>
        <Box display="flex" justifyContent="end">
          <Button
            variant="contained"
            onClick={handleCreateCalloutOpened}
          >
            {t('pages.explore.create-callout')}
          </Button>
        </Box>
        <CanvasesView canvasId={canvasId} parentUrl={currentPath.pathname} entityTypeName={entityTypeName} />
        <SectionSpacer />
        <ContributeTabContainer
          hubNameId={hubNameId}
          challengeNameId={challengeNameId}
          opportunityNameId={opportunityNameId}
          component={ContributeView}
        />
      </PageLayout>
      <CalloutCreationDialog
        open={isCalloutCreationDialogOpen}
        onClose={handleCreateCalloutClosed}
        onCreate={handleCreateCalloutCreated}
      />
    </>
  );
};

export default ContributePage;

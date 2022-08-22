import React, { FC, useMemo } from 'react';
import { useResolvedPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Box } from '@mui/material';
import { useUrlParams } from '../../hooks';
import ContributeTabContainer from '../../containers/ContributeTabContainer/ContributeTabContainer';
import ContributeView from '../../views/ContributeView/ContributeView';
import HubPageLayout from '../../domain/hub/layout/HubPageLayout';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import { EntityTypeName } from '../../domain/shared/layout/PageLayout/SimplePageLayout';
import ChallengePageLayout from '../../domain/challenge/layout/ChallengePageLayout';
import OpportunityPageLayout from '../../domain/opportunity/layout/OpportunityPageLayout';
import CanvasesView from '../../domain/canvas/EntityCanvasPage/CanvasesView';
import { SectionSpacer } from '../../domain/shared/components/Section/Section';
import CalloutCreationDialog from '../../domain/callout/creation-dialog/CalloutCreationDialog';
import { useCalloutCreation } from '../../domain/callout/creation-dialog/useCalloutCreation/useCalloutCreation';

interface ContributePageProps {
  entityTypeName: EntityTypeName;
}

const ContributePage: FC<ContributePageProps> = ({ entityTypeName }) => {
  const { t } = useTranslation();
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

  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCalloutPublished,
    handleCalloutDrafted,
    isPublishing,
  } = useCalloutCreation();

  if (!hubNameId) {
    return <></>;
  }

  return (
    <>
      <PageLayout currentSection={EntityPageSection.Explore}>
        <Box display="flex" justifyContent="end">
          <Button variant="contained" onClick={handleCreateCalloutOpened}>
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
        onPublish={handleCalloutPublished}
        onSaveAsDraft={handleCalloutDrafted}
        isPublishing={isPublishing}
      />
    </>
  );
};

export default ContributePage;

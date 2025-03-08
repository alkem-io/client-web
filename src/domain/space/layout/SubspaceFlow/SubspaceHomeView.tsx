import { useTranslation } from 'react-i18next';
import { Button, Theme, useMediaQuery } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { SpaceLevel, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import InnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import CalloutsGroupView from '@/domain/collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView';
import useCalloutsSet, { OrderUpdate } from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { InnovationFlowState } from '@/domain/collaboration/InnovationFlow/InnovationFlow';
import React, { useEffect, useState } from 'react';
import { SubspaceInnovationFlow, useConsumeAction } from '../../../journey/subspace/layout/SubspacePageLayout';
import { useCalloutCreationWithPreviewImages } from '@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreationWithPreviewImages';
import CalloutCreationDialog from '@/domain/collaboration/callout/creationDialog/CalloutCreationDialog';
import { SubspaceDialog } from '../../../journey/subspace/layout/SubspaceDialog';
import InnovationFlowVisualizerMobile from '@/domain/collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowVisualizerMobile';
import InnovationFlowChips from '@/domain/collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowChips';
import InnovationFlowSettingsButton from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettingsButton';
import { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/ClassificationTagset.model';

interface SubspaceHomeViewProps {
  spaceLevel: SpaceLevel | undefined;
  collaborationId: string | undefined;
  calloutsSetId: string | undefined;
  templatesSetId: string | undefined;
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentInnovationFlowState: string | undefined;
  canCreateCallout: boolean;
  loading: boolean;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
}

const SubspaceHomeView = ({
  collaborationId,
  calloutsSetId,
  templatesSetId,
  innovationFlowStates,
  currentInnovationFlowState,
  canCreateCallout,
  loading,
  onCalloutsSortOrderUpdate,
  refetchCallout,
}: SubspaceHomeViewProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const { isCalloutCreationDialogOpen, handleCreateCalloutOpened, handleCreateCalloutClosed, handleCreateCallout } =
    useCalloutCreationWithPreviewImages({ calloutsSetId });

  const createButton = (
    <Button
      variant="outlined"
      startIcon={<AddCircleOutlineIcon />}
      sx={{
        backgroundColor: 'background.paper',
        borderColor: 'divider',
        textWrap: 'nowrap',
      }}
      onClick={handleCreateCalloutOpened}
    >
      {t('common.collaborationTool')}
    </Button>
  );

  // on innovation flow tab change
  const [selectedInnovationFlowState, setSelectedInnovationFlowState] = useState(currentInnovationFlowState);

  const doesSelectedInnovationFlowStateExist = innovationFlowStates?.some(
    state => state.displayName === selectedInnovationFlowState
  );

  // on e.g. innovation flow template change #6319
  useEffect(() => {
    if (!doesSelectedInnovationFlowStateExist) {
      setSelectedInnovationFlowState(currentInnovationFlowState);
    }
  }, [doesSelectedInnovationFlowStateExist]);

  let classificationTagsets: ClassificationTagsetModel[] = [];
  if (selectedInnovationFlowState) {
    classificationTagsets = [
      {
        name: TagsetReservedName.FlowState,
        tags: [selectedInnovationFlowState],
      },
    ];
  }

  const calloutsSetProvided = useCalloutsSet({
    calloutsSetId,
    classificationTagsets: classificationTagsets,
    canSaveAsTemplate: false,
    entitledToSaveAsTemplate: false,
    includeClassification: true,
  });

  // If it's mobile the ManageFlow action will be consumed somewhere else,
  // if there is no definition for it, button should not be shown
  const manageFlowActionDef = useConsumeAction(!isMobile ? SubspaceDialog.ManageFlow : undefined);

  return (
    <>
      <SubspaceInnovationFlow>
        {innovationFlowStates && currentInnovationFlowState && selectedInnovationFlowState && collaborationId && (
          <InnovationFlowStates
            states={innovationFlowStates}
            currentState={currentInnovationFlowState}
            selectedState={selectedInnovationFlowState}
            onSelectState={state => setSelectedInnovationFlowState(state.displayName)}
            visualizer={isMobile ? InnovationFlowVisualizerMobile : InnovationFlowChips}
            createButton={canCreateCallout && createButton}
            settingsButton={
              manageFlowActionDef && (
                <InnovationFlowSettingsButton
                  collaborationId={collaborationId}
                  templatesSetId={templatesSetId}
                  tooltip={manageFlowActionDef.label}
                  icon={manageFlowActionDef.icon}
                />
              )
            }
          />
        )}
      </SubspaceInnovationFlow>
      <CalloutsGroupView
        calloutsSetId={calloutsSetId}
        callouts={calloutsSetProvided.callouts}
        canCreateCallout={canCreateCallout && isMobile}
        loading={loading}
        onSortOrderUpdate={onCalloutsSortOrderUpdate}
        onCalloutUpdate={refetchCallout}
        createButtonPlace="top"
        createInFlowState={selectedInnovationFlowState}
      />
      <CalloutCreationDialog
        open={isCalloutCreationDialogOpen}
        onClose={handleCreateCalloutClosed}
        onCreateCallout={handleCreateCallout}
        loading={loading}
        flowState={selectedInnovationFlowState}
      />
    </>
  );
};

export default SubspaceHomeView;

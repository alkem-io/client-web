import { useTranslation } from 'react-i18next';
import { Button, Theme, useMediaQuery } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { JourneyTypeName } from '@/domain/journey/JourneyTypeName';
import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';
import InnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import CalloutsGroupView from '@/domain/collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '@/domain/collaboration/callout/useCallouts/useCallouts';
import { InnovationFlowState } from '@/domain/collaboration/InnovationFlow/InnovationFlow';
import React, { useEffect, useMemo, useState } from 'react';
import { SubspaceInnovationFlow, useConsumeAction } from '../layout/SubspacePageLayout';
import { useCalloutCreationWithPreviewImages } from '@/domain/collaboration/callout/creationDialog/useCalloutCreation/useCalloutCreationWithPreviewImages';
import CalloutCreationDialog from '@/domain/collaboration/callout/creationDialog/CalloutCreationDialog';
import { SubspaceDialog } from '../layout/SubspaceDialog';
import InnovationFlowVisualizerMobile from '@/domain/collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowVisualizerMobile';
import InnovationFlowChips from '@/domain/collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowChips';
import InnovationFlowSettingsButton from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettingsButton';
import { CalloutGroupNameValuesMap } from '@/domain/collaboration/callout/CalloutsInContext/CalloutsGroup';

interface SubspaceHomeViewProps {
  journeyId: string | undefined;
  collaborationId: string | undefined;
  templatesSetId: string | undefined;
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentInnovationFlowState: string | undefined;
  callouts: TypedCallout[] | undefined;
  canCreateCallout: boolean;
  loading: boolean;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  journeyTypeName: JourneyTypeName;
}

const SubspaceHomeView = ({
  journeyId,
  collaborationId,
  templatesSetId,
  innovationFlowStates,
  currentInnovationFlowState,
  callouts,
  canCreateCallout,
  loading,
  onCalloutsSortOrderUpdate,
  refetchCallout,
  journeyTypeName,
}: SubspaceHomeViewProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const { isCalloutCreationDialogOpen, handleCreateCalloutOpened, handleCreateCalloutClosed, handleCreateCallout } =
    useCalloutCreationWithPreviewImages({ collaborationId });

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

  const selectedFlowStateCallouts = useMemo(() => {
    const filterCallouts = (callouts: TypedCallout[] | undefined) => {
      return callouts?.filter(callout => {
        if (!selectedInnovationFlowState) {
          return true;
        }
        return callout.flowStates?.includes(selectedInnovationFlowState);
      });
    };

    return filterCallouts(callouts);
  }, [callouts, selectedInnovationFlowState]);

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
                  filterCalloutGroups={[CalloutGroupNameValuesMap.Home]}
                  tooltip={manageFlowActionDef.label}
                  icon={manageFlowActionDef.icon}
                />
              )
            }
          />
        )}
      </SubspaceInnovationFlow>
      <CalloutsGroupView
        journeyId={journeyId}
        collaborationId={collaborationId}
        callouts={selectedFlowStateCallouts}
        canCreateCallout={canCreateCallout && isMobile}
        loading={loading}
        journeyTypeName={journeyTypeName}
        onSortOrderUpdate={onCalloutsSortOrderUpdate}
        onCalloutUpdate={refetchCallout}
        groupName={CalloutGroupName.Home}
        createButtonPlace="top"
        flowState={selectedInnovationFlowState}
      />
      <CalloutCreationDialog
        open={isCalloutCreationDialogOpen}
        onClose={handleCreateCalloutClosed}
        onCreateCallout={handleCreateCallout}
        loading={loading}
        groupName={CalloutGroupName.Home}
        journeyTypeName={journeyTypeName}
        flowState={selectedInnovationFlowState}
      />
    </>
  );
};

export default SubspaceHomeView;

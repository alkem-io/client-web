import { useTranslation } from 'react-i18next';
import { Button, ButtonProps } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { JourneyTypeName } from '../../JourneyTypeName';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import InnovationFlowStates from '../../../collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '../../../collaboration/callout/useCallouts/useCallouts';
import { InnovationFlowState } from '../../../collaboration/InnovationFlow/InnovationFlow';
import React, { useState } from 'react';
import { SubspaceInnovationFlow, useConsumeAction } from '../layout/SubspacePageLayout';
import { useColumns } from '../../../../core/ui/grid/GridContext';
import { GRID_COLUMNS_MOBILE } from '../../../../core/ui/grid/constants';
import ButtonWithTooltip from '../../../../core/ui/button/ButtonWithTooltip';
import { useCalloutCreationWithPreviewImages } from '../../../collaboration/callout/creationDialog/useCalloutCreation/useCalloutCreationWithPreviewImages';
import CalloutCreationDialog from '../../../collaboration/callout/creationDialog/CalloutCreationDialog';
import { SubspaceDialog } from '../layout/SubspaceDialog';
import InnovationFlowVisualizerMobile from '../../../collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowVisualizerMobile';
import InnovationFlowChips from '../../../collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowChips';
import InnovationFlowSettingsDialog from '../../../collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettingsDialog';
import { CalloutGroupNameValuesMap } from '../../../collaboration/callout/CalloutsInContext/CalloutsGroup';

interface SubspaceHomeViewProps {
  journeyId: string | undefined;
  collaborationId: string | undefined;
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentInnovationFlowState: string | undefined;
  selectedInnovationFlowState: string | undefined;
  onSelectInnovationFlowState: (state: InnovationFlowState) => void;
  canEditInnovationFlow: boolean | undefined;
  selectedFlowStateCallouts: TypedCallout[] | undefined;
  canCreateCallout: boolean;
  canCreateCalloutFromTemplate: boolean;
  calloutNames: string[];
  loading: boolean;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  journeyTypeName: JourneyTypeName;
}

const InnovationFlowSettingsButton = ({ collaborationId, ...props }: ButtonProps & { collaborationId: string }) => {
  const settingsActionDef = useConsumeAction(SubspaceDialog.ManageFlow);
  const [isSettingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const SettingsIcon = settingsActionDef?.icon;
  return (
    <>
      <ButtonWithTooltip
        tooltip={String(settingsActionDef?.label)}
        variant="outlined"
        iconButton
        {...props}
        onClick={() => setSettingsDialogOpen(true)}
      >
        {SettingsIcon && <SettingsIcon />}
      </ButtonWithTooltip>
      <InnovationFlowSettingsDialog
        open={isSettingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        collaborationId={collaborationId}
        filterCalloutGroups={[CalloutGroupNameValuesMap.Home]}
      />
    </>
  );
};

const SubspaceHomeView = ({
  journeyId,
  collaborationId,
  innovationFlowStates,
  currentInnovationFlowState,
  selectedInnovationFlowState,
  onSelectInnovationFlowState,
  canEditInnovationFlow = false,
  selectedFlowStateCallouts,
  canCreateCallout,
  canCreateCalloutFromTemplate,
  calloutNames,
  loading,
  onCalloutsSortOrderUpdate,
  refetchCallout,
  journeyTypeName,
}: SubspaceHomeViewProps) => {
  const columns = useColumns();
  const { t } = useTranslation();
  const { isCalloutCreationDialogOpen, handleCreateCalloutOpened, handleCreateCalloutClosed, handleCreateCallout } =
    useCalloutCreationWithPreviewImages({ journeyId });

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

  const isMobile = columns <= GRID_COLUMNS_MOBILE;

  return (
    <>
      <SubspaceInnovationFlow columns={columns}>
        {innovationFlowStates && currentInnovationFlowState && selectedInnovationFlowState && collaborationId && (
          <InnovationFlowStates
            states={innovationFlowStates}
            currentState={currentInnovationFlowState}
            selectedState={selectedInnovationFlowState}
            onSelectState={onSelectInnovationFlowState}
            visualizer={isMobile ? InnovationFlowVisualizerMobile : InnovationFlowChips}
            createButton={canCreateCallout && createButton}
            settingsButton={
              canEditInnovationFlow ? <InnovationFlowSettingsButton collaborationId={collaborationId} /> : undefined
            }
          />
        )}
      </SubspaceInnovationFlow>
      <CalloutsGroupView
        journeyId={journeyId}
        callouts={selectedFlowStateCallouts}
        canCreateCallout={canCreateCallout && isMobile}
        canCreateCalloutFromTemplate={canCreateCalloutFromTemplate}
        loading={loading}
        journeyTypeName={journeyTypeName}
        calloutNames={calloutNames}
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
        calloutNames={calloutNames}
        groupName={CalloutGroupName.Home}
        journeyTypeName={journeyTypeName}
        canCreateCalloutFromTemplate={canCreateCalloutFromTemplate}
      />
    </>
  );
};

export default SubspaceHomeView;

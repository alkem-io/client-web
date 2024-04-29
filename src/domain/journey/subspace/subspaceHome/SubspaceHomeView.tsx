import { useTranslation } from 'react-i18next';
import { Button, ButtonProps } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { JourneyTypeName } from '../../JourneyTypeName';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import InnovationFlowStates from '../../../collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '../../../collaboration/callout/useCallouts/useCallouts';
import { InnovationFlowState } from '../../../collaboration/InnovationFlow/InnovationFlow';
import React, { useMemo, useState } from 'react';
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
import useStateWithAsyncDefault from '../../../../core/utils/useStateWithAsyncDefault';

interface SubspaceHomeViewProps {
  journeyId: string | undefined;
  collaborationId: string | undefined;
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentInnovationFlowState: string | undefined;
  canEditInnovationFlow: boolean | undefined;
  callouts: TypedCallout[] | undefined;
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
  callouts,
  canEditInnovationFlow = false,
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

  const [selectedInnovationFlowState, setSelectedInnovationFlowState] =
    useStateWithAsyncDefault(currentInnovationFlowState);

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
        flowState={selectedInnovationFlowState}
      />
    </>
  );
};

export default SubspaceHomeView;

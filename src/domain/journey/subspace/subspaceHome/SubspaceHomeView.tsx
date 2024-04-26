import { useTranslation } from 'react-i18next';
import { Button, ButtonProps } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { JourneyTypeName } from '../../JourneyTypeName';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import InnovationFlowStates from '../../../collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '../../../collaboration/callout/useCallouts/useCallouts';
import { InnovationFlowState } from '../../../collaboration/InnovationFlow/InnovationFlow';
import React from 'react';
import { SubspaceInnovationFlow, useConsumeAction } from '../layout/SubspacePageLayout';
import { useColumns } from '../../../../core/ui/grid/GridContext';
import { GRID_COLUMNS_MOBILE } from '../../../../core/ui/grid/constants';
import ButtonWithTooltip from '../../../../core/ui/button/ButtonWithTooltip';
import InnovationFlowCurrentStateSelector from '../../../collaboration/InnovationFlow/InnovationFlowCurrentStateSelector/InnovationFlowCurrentStateSelector';
import { useCalloutCreationWithPreviewImages } from '../../../collaboration/callout/creationDialog/useCalloutCreation/useCalloutCreationWithPreviewImages';
import CalloutCreationDialog from '../../../collaboration/callout/creationDialog/CalloutCreationDialog';
import { SubspaceDialog } from '../layout/SubspaceDialog';

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

const InnovationFlowVisualizerMobile = props => (
  <InnovationFlowCurrentStateSelector {...props} flexShrink={1} minWidth={0} />
);

const SettingsButton = (props: ButtonProps) => {
  const settingsActionDef = useConsumeAction(SubspaceDialog.ManageFlow);

  const SettingsIcon = settingsActionDef?.icon;

  return (
    <ButtonWithTooltip tooltip={String(settingsActionDef?.label)} variant="outlined" iconButton {...props}>
      {SettingsIcon && <SettingsIcon />}
    </ButtonWithTooltip>
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
      <SubspaceInnovationFlow>
        {innovationFlowStates &&
          currentInnovationFlowState &&
          selectedInnovationFlowState &&
          (canEditInnovationFlow ? (
            <InnovationFlowStates
              collaborationId={collaborationId!}
              states={innovationFlowStates}
              currentState={currentInnovationFlowState}
              selectedState={selectedInnovationFlowState}
              settings={<SettingsButton />}
              createButton={canCreateCallout && createButton}
              onSelectState={onSelectInnovationFlowState}
              visualizer={isMobile ? InnovationFlowVisualizerMobile : undefined}
            />
          ) : (
            <InnovationFlowStates
              states={innovationFlowStates}
              currentState={currentInnovationFlowState}
              selectedState={selectedInnovationFlowState}
              onSelectState={onSelectInnovationFlowState}
              visualizer={isMobile ? InnovationFlowVisualizerMobile : undefined}
            />
          ))}
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
        groupName={CalloutGroupName.Contribute}
        createButtonPlace="top"
        flowState={selectedInnovationFlowState}
      />
      <CalloutCreationDialog
        open={isCalloutCreationDialogOpen}
        onClose={handleCreateCalloutClosed}
        onCreateCallout={handleCreateCallout}
        loading={loading}
        calloutNames={calloutNames}
        groupName={CalloutGroupName.Contribute}
        journeyTypeName={journeyTypeName}
        canCreateCalloutFromTemplate={canCreateCalloutFromTemplate}
      />
    </>
  );
};

export default SubspaceHomeView;

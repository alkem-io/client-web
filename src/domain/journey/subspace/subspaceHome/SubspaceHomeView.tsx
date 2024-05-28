import { useTranslation } from 'react-i18next';
import { Button, Theme, useMediaQuery } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { JourneyTypeName } from '../../JourneyTypeName';
import { BodyOfKnowledgeType, CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import InnovationFlowStates from '../../../collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '../../../collaboration/callout/useCallouts/useCallouts';
import { InnovationFlowState } from '../../../collaboration/InnovationFlow/InnovationFlow';
import React, { useMemo } from 'react';
import { SubspaceInnovationFlow, useConsumeAction } from '../layout/SubspacePageLayout';
import { useCalloutCreationWithPreviewImages } from '../../../collaboration/callout/creationDialog/useCalloutCreation/useCalloutCreationWithPreviewImages';
import CalloutCreationDialog from '../../../collaboration/callout/creationDialog/CalloutCreationDialog';
import { SubspaceDialog } from '../layout/SubspaceDialog';
import InnovationFlowVisualizerMobile from '../../../collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowVisualizerMobile';
import InnovationFlowChips from '../../../collaboration/InnovationFlow/InnovationFlowVisualizers/InnovationFlowChips';
import useResettableState from '../../../../core/utils/useResettableState';
import InnovationFlowSettingsButton from '../../../collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettingsButton';
import { CalloutGroupNameValuesMap } from '../../../collaboration/callout/CalloutsInContext/CalloutsGroup';
import {
  useCreateVirtualContributorMutation,
  useVirtualContributorAvailablePersonasQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useSpace } from '../../space/SpaceContext/useSpace';

interface SubspaceHomeViewProps {
  journeyId: string | undefined;
  collaborationId: string | undefined;
  innovationFlowId: string | undefined;
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentInnovationFlowState: string | undefined;
  callouts: TypedCallout[] | undefined;
  canCreateCallout: boolean;
  calloutNames: string[];
  loading: boolean;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  journeyTypeName: JourneyTypeName;
}

const SubspaceHomeView = ({
  journeyId,
  collaborationId,
  innovationFlowId,
  innovationFlowStates,
  currentInnovationFlowState,
  callouts,
  canCreateCallout,
  calloutNames,
  loading,
  onCalloutsSortOrderUpdate,
  refetchCallout,
  journeyTypeName,
}: SubspaceHomeViewProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const { isCalloutCreationDialogOpen, handleCreateCalloutOpened, handleCreateCalloutClosed, handleCreateCallout } =
    useCalloutCreationWithPreviewImages({ journeyId });

  const {
    spaceId: bodyOfKnowledgeID,
    spaceNameId,
    accountId,
    profile: { displayName },
  } = useSpace();

  const [createVirtualContributor] = useCreateVirtualContributorMutation();

  const handleCreateVirtualContributor = async () => {
    if (!vpData) return;
    await createVirtualContributor({
      variables: {
        virtualContributorData: {
          accountID: accountId,
          nameID: `${spaceNameId}-${new Date().getTime()}`,
          bodyOfKnowledgeType: BodyOfKnowledgeType.Space,
          bodyOfKnowledgeID,
          virtualPersonaID: vpData.virtualPersonas[0].id,
          profileData: {
            displayName: `${displayName}-${new Date().toString()}`,
          },
        },
      },
    });
  };

  const { data: vpData } = useVirtualContributorAvailablePersonasQuery();
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

  const [selectedInnovationFlowState, setSelectedInnovationFlowState] = useResettableState(currentInnovationFlowState, [
    innovationFlowId,
  ]);

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
                  filterCalloutGroups={[CalloutGroupNameValuesMap.Home]}
                  tooltip={manageFlowActionDef.label}
                  icon={manageFlowActionDef.icon}
                />
              )
            }
          />
        )}
        {vpData?.virtualPersonas && (
          <Button startIcon={<AddCircleOutlineIcon />} onClick={handleCreateVirtualContributor}>
            Create Virtual Contributor
          </Button>
        )}
      </SubspaceInnovationFlow>
      <CalloutsGroupView
        journeyId={journeyId}
        callouts={selectedFlowStateCallouts}
        canCreateCallout={canCreateCallout && isMobile}
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
        flowState={selectedInnovationFlowState}
      />
    </>
  );
};

export default SubspaceHomeView;

import useStateWithAsyncDefault from '../../../../core/utils/useStateWithAsyncDefault';
import { JourneyTypeName } from '../../JourneyTypeName';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import InnovationFlowStates from '../../../collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '../../../collaboration/callout/useCallouts/useCallouts';
import { InnovationFlowState } from '../../../collaboration/InnovationFlow/InnovationFlow';
import React from 'react';

interface SubspaceHomeViewProps {
  collaborationId: string | undefined;
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentInnovationFlowState: string | undefined;
  canEditInnovationFlow: boolean | undefined;
  groupedCallouts: Record<CalloutGroupName, TypedCallout[] | undefined>;
  canCreateCallout: boolean;
  canCreateCalloutFromTemplate: boolean;
  calloutNames: string[];
  loading: boolean;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
  journeyTypeName: JourneyTypeName;
}

const SubspaceHomeView = ({
  collaborationId,
  innovationFlowStates,
  currentInnovationFlowState,
  canEditInnovationFlow = false,
  groupedCallouts,
  canCreateCallout,
  canCreateCalloutFromTemplate,
  calloutNames,
  loading,
  onCalloutsSortOrderUpdate,
  refetchCallout,
  journeyTypeName,
}: SubspaceHomeViewProps) => {
  const [selectedInnovationFlowState, setSelectedInnovationFlowState] =
    useStateWithAsyncDefault(currentInnovationFlowState);

  const filterCallouts = (callouts: TypedCallout[] | undefined) => {
    return callouts?.filter(callout => {
      if (!selectedInnovationFlowState) {
        return true;
      }
      return callout.flowStates?.includes(selectedInnovationFlowState);
    });
  };

  const handleSelectInnovationFlowState = (state: InnovationFlowState) =>
    setSelectedInnovationFlowState(state.displayName);

  return (
    <>
      {innovationFlowStates &&
        currentInnovationFlowState &&
        selectedInnovationFlowState &&
        (canEditInnovationFlow ? (
          <InnovationFlowStates
            collaborationId={collaborationId!}
            states={innovationFlowStates}
            currentState={currentInnovationFlowState}
            selectedState={selectedInnovationFlowState}
            showSettings
            onSelectState={handleSelectInnovationFlowState}
          />
        ) : (
          <InnovationFlowStates
            states={innovationFlowStates}
            currentState={currentInnovationFlowState}
            selectedState={selectedInnovationFlowState}
            onSelectState={handleSelectInnovationFlowState}
          />
        ))}
      <CalloutsGroupView
        callouts={filterCallouts(groupedCallouts[CalloutGroupName.Contribute_2])}
        canCreateCallout={canCreateCallout}
        canCreateCalloutFromTemplate={canCreateCalloutFromTemplate}
        loading={loading}
        journeyTypeName={journeyTypeName}
        calloutNames={calloutNames}
        onSortOrderUpdate={onCalloutsSortOrderUpdate}
        onCalloutUpdate={refetchCallout}
        groupName={CalloutGroupName.Contribute_2}
        createButtonPlace="top"
        flowState={selectedInnovationFlowState}
      />
    </>
  );
};

export default SubspaceHomeView;

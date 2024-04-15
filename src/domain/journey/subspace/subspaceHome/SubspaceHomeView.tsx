import { Button } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutGroupName, InnovationFlowState } from '../../../../core/apollo/generated/graphql-schema';
import ContentColumn from '../../../../core/ui/content/ContentColumn';
import InfoColumn from '../../../../core/ui/content/InfoColumn';
import PageContent from '../../../../core/ui/content/PageContent';
import useStateWithAsyncDefault from '../../../../core/utils/useStateWithAsyncDefault';
import { ContributeInnovationFlowBlock } from '../../../collaboration/InnovationFlow/ContributeInnovationFlowBlock/ContributeInnovationFlowBlock';
import InnovationFlowStates from '../../../collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import CalloutsGroupView from '../../../collaboration/callout/CalloutsInContext/CalloutsGroupView';
import CalloutsListDialog from '../../../collaboration/callout/CalloutsListDialog/CalloutsListDialog';
import JourneyCalloutsListItemTitle from '../../../collaboration/callout/JourneyCalloutsTabView/JourneyCalloutsListItemTitle';
import { OrderUpdate, TypedCallout } from '../../../collaboration/callout/useCallouts/useCallouts';
import MembershipBackdrop from '../../../shared/components/Backdrops/MembershipBackdrop';
import { JourneyTypeName } from '../../JourneyTypeName';

interface SubspaceHomeViewProps {
  collaborationId: string | undefined;
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentInnovationFlowState: string | undefined;
  canEditInnovationFlow: boolean | undefined;
  callouts: TypedCallout[] | undefined;
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
  callouts: allCallouts,
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
  const [isCalloutsListDialogOpen, setCalloutsListDialogOpen] = useState(false);

  const filterCallouts = (callouts: TypedCallout[] | undefined) => {
    return callouts?.filter(callout => {
      if (!selectedInnovationFlowState) {
        return true;
      }
      return callout.flowStates?.includes(selectedInnovationFlowState);
    });
  };

  const { t } = useTranslation();

  const handleSelectInnovationFlowState = (state: InnovationFlowState) =>
    setSelectedInnovationFlowState(state.displayName);

  const contributeLeftCalloutsIds = groupedCallouts[CalloutGroupName.Contribute_1]?.map(callout => callout.id) ?? [];

  return (
    <>
      <MembershipBackdrop show={!loading && !allCallouts} blockName={t(`common.${journeyTypeName}` as const)}>
        <PageContent>
          <InfoColumn>
            <ContributeInnovationFlowBlock collaborationId={collaborationId} journeyTypeName={journeyTypeName} />
            <Button onClick={() => setCalloutsListDialogOpen(true)}>Callouts List</Button>
            <CalloutsListDialog
              open={isCalloutsListDialogOpen}
              onClose={() => setCalloutsListDialogOpen(false)}
              callouts={allCallouts}
              renderCallout={callout => (
                <JourneyCalloutsListItemTitle
                  callout={{
                    ...callout,
                    flowStates: contributeLeftCalloutsIds.includes(callout.id) ? [] : callout.flowStates,
                  }}
                />
              )}
              emptyListCaption={t('pages.generic.sections.subentities.empty-list', {
                entities: t('common.callouts'),
              })}
            />
            <CalloutsGroupView
              callouts={groupedCallouts[CalloutGroupName.Contribute_1]}
              canCreateCallout={canCreateCallout}
              canCreateCalloutFromTemplate={canCreateCalloutFromTemplate}
              loading={loading}
              journeyTypeName={journeyTypeName}
              calloutNames={calloutNames}
              onSortOrderUpdate={onCalloutsSortOrderUpdate}
              onCalloutUpdate={refetchCallout}
              groupName={CalloutGroupName.Contribute_1}
              flowState={selectedInnovationFlowState}
            />
          </InfoColumn>

          <ContentColumn>
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
          </ContentColumn>
        </PageContent>
      </MembershipBackdrop>
    </>
  );
};

export default SubspaceHomeView;

import { useTranslation } from 'react-i18next';
import PageContent from '../../../../core/ui/content/PageContent';
import { Button } from '@mui/material';
import { useState } from 'react';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import useStateWithAsyncDefault from '../../../../core/utils/useStateWithAsyncDefault';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import MembershipBackdrop from '../../../shared/components/Backdrops/MembershipBackdrop';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import { ContributeInnovationFlowBlock } from '../../InnovationFlow/ContributeInnovationFlowBlock/ContributeInnovationFlowBlock';
import InnovationFlowStates from '../../InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import CalloutsGroupView from '../CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '../useCallouts/useCallouts';
import CalloutsListDialog from '../CalloutsListDialog/CalloutsListDialog';
import JourneyCalloutsListItemTitle from './JourneyCalloutsListItemTitle';
import { InnovationFlowState } from '../../InnovationFlow/InnovationFlow';

interface JourneyCalloutsTabViewProps {
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

const JourneyCalloutsTabView = ({
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
}: JourneyCalloutsTabViewProps) => {
  const [isCalloutsListDialogOpen, setCalloutsListDialogOpen] = useState(false);
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

  const { t } = useTranslation();

  const handleSelectInnovationFlowState = (state: InnovationFlowState) =>
    setSelectedInnovationFlowState(state.displayName);

  const contributeLeftCalloutsIds = groupedCallouts[CalloutGroupName.Contribute_1]?.map(callout => callout.id) ?? [];

  return (
    <>
      <MembershipBackdrop show={!loading && !allCallouts} blockName={t(`common.${journeyTypeName}` as const)}>
        <PageContent>
          <PageContentColumn columns={4}>
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
          </PageContentColumn>

          <PageContentColumn columns={8}>
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
          </PageContentColumn>
        </PageContent>
      </MembershipBackdrop>
    </>
  );
};

export default JourneyCalloutsTabView;

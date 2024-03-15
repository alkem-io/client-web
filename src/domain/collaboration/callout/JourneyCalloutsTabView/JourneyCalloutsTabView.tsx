import { useTranslation } from 'react-i18next';
import { buildCalloutUrl, JourneyLocation } from '../../../../main/routing/urlBuilders';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import LinksList from '../../../../core/ui/list/LinksList';
import useStateWithAsyncDefault from '../../../../core/utils/useStateWithAsyncDefault';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import MembershipBackdrop from '../../../shared/components/Backdrops/MembershipBackdrop';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import { ContributeInnovationFlowBlock } from '../../InnovationFlow/ContributeInnovationFlowBlock/ContributeInnovationFlowBlock';
import InnovationFlowStates from '../../InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import CalloutsGroupView from '../CalloutsInContext/CalloutsGroupView';
import { OrderUpdate, TypedCallout } from '../useCallouts/useCallouts';
import calloutIcons from '../utils/calloutIcons';
import JourneyCalloutsListItemTitle from './JourneyCalloutsListItemTitle';
import { InnovationFlowState } from '../../InnovationFlow/InnovationFlow';

interface JourneyCalloutsTabViewProps extends JourneyLocation {
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
  canEditInnovationFlow,
  callouts: allCallouts,
  groupedCallouts,
  canCreateCallout,
  canCreateCalloutFromTemplate,
  calloutNames,
  loading,
  onCalloutsSortOrderUpdate,
  refetchCallout,
  journeyTypeName,
  spaceNameId,
  challengeNameId,
  opportunityNameId,
}: JourneyCalloutsTabViewProps) => {
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

  const contributeLeftCalloutsIds = groupedCallouts[CalloutGroupName.ContributeLeft]?.map(callout => callout.id) ?? [];

  return (
    <>
      <MembershipBackdrop show={!loading && !allCallouts} blockName={t(`common.${journeyTypeName}` as const)}>
        <PageContent>
          <PageContentColumn columns={4}>
            <ContributeInnovationFlowBlock collaborationId={collaborationId} journeyTypeName={journeyTypeName} />
            <PageContentBlock>
              <PageContentBlockHeader
                title={t('pages.generic.sections.subentities.list', { entities: t('common.callouts') })}
              />
              <LinksList
                items={allCallouts?.map(callout => {
                  const CalloutIcon = calloutIcons[callout.type];
                  return {
                    id: callout.id,
                    title: (
                      <JourneyCalloutsListItemTitle
                        callout={{
                          ...callout,
                          flowStates: contributeLeftCalloutsIds.includes(callout.id) ? [] : callout.flowStates,
                        }}
                      />
                    ),
                    icon: <CalloutIcon />,
                    uri: buildCalloutUrl(callout.nameID, {
                      spaceNameId,
                      challengeNameId,
                      opportunityNameId,
                    }),
                  };
                })}
                emptyListCaption={t('pages.generic.sections.subentities.empty-list', {
                  entities: t('common.callouts'),
                  parentEntity: t(`common.${journeyTypeName}` as const),
                })}
                loading={loading}
              />
            </PageContentBlock>
            <CalloutsGroupView
              callouts={groupedCallouts[CalloutGroupName.ContributeLeft]}
              spaceId={spaceNameId}
              canCreateCallout={canCreateCallout}
              canCreateCalloutFromTemplate={canCreateCalloutFromTemplate}
              loading={loading}
              journeyTypeName={journeyTypeName}
              calloutNames={calloutNames}
              onSortOrderUpdate={onCalloutsSortOrderUpdate}
              onCalloutUpdate={refetchCallout}
              groupName={CalloutGroupName.ContributeLeft}
              flowState={selectedInnovationFlowState}
            />
          </PageContentColumn>

          <PageContentColumn columns={8}>
            {innovationFlowStates && currentInnovationFlowState && selectedInnovationFlowState && (
              <InnovationFlowStates
                collaborationId={collaborationId}
                states={innovationFlowStates}
                currentState={currentInnovationFlowState}
                selectedState={selectedInnovationFlowState}
                journeyTypeName={journeyTypeName}
                showSettings={canEditInnovationFlow}
                onSelectState={handleSelectInnovationFlowState}
              />
            )}
            <CalloutsGroupView
              callouts={filterCallouts(groupedCallouts[CalloutGroupName.ContributeRight])}
              spaceId={spaceNameId}
              canCreateCallout={canCreateCallout}
              canCreateCalloutFromTemplate={canCreateCalloutFromTemplate}
              loading={loading}
              journeyTypeName={journeyTypeName}
              calloutNames={calloutNames}
              onSortOrderUpdate={onCalloutsSortOrderUpdate}
              onCalloutUpdate={refetchCallout}
              groupName={CalloutGroupName.ContributeRight}
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

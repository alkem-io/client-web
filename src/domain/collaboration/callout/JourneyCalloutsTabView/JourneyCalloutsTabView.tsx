import { useTranslation } from 'react-i18next';
import { buildCalloutUrl } from '../../../../common/utils/urlBuilders';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import LinksList from '../../../../core/ui/list/LinksList';
import useStateWithAsyncDefault from '../../../../core/utils/useStateWithAsyncDefault';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import MembershipBackdrop from '../../../shared/components/Backdrops/MembershipBackdrop';
import { CalloutDisplayLocation } from '../../../../core/apollo/generated/graphql-schema';
import { ContributeInnovationFlowBlock } from '../../InnovationFlow/ContributeInnovationFlowBlock/ContributeInnovationFlowBlock';
import InnovationFlowStates, {
  InnovationFlowState,
} from '../../InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import useInnovationFlowStates from '../../InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import CalloutsGroupView from '../CalloutsInContext/CalloutsGroupView';
import useCallouts from '../useCallouts/useCallouts';
import calloutIcons from '../utils/calloutIcons';
import JourneyCalloutsListItemTitle from './JourneyCalloutsListItemTitle';

interface JourneyCalloutsTabViewProps {
  journeyTypeName: JourneyTypeName;
  scrollToCallout?: boolean;
}

const JourneyCalloutsTabView = ({ journeyTypeName, scrollToCallout }: JourneyCalloutsTabViewProps) => {
  const { spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Must be within a Space');
  }

  const { innovationFlowStates, currentInnovationFlowState } = useInnovationFlowStates({
    spaceId: spaceNameId,
    challengeId: challengeNameId!,
    opportunityId: opportunityNameId,
  });

  const [selectedInnovationFlowState, setSelectedInnovationFlowState] =
    useStateWithAsyncDefault(currentInnovationFlowState);

  const {
    callouts: allCallouts,
    canCreateCallout,
    calloutNames,
    loading,
    calloutsSortOrder,
    onCalloutsSortOrderUpdate,
    refetchCallout,
  } = useCallouts({
    spaceNameId,
    challengeNameId,
    opportunityNameId,
  });

  const callouts = allCallouts
    ?.filter(callout => callout.displayLocation !== CalloutDisplayLocation.HomeTop)
    ?.filter(callout => {
      if (!selectedInnovationFlowState) {
        return true;
      }
      return callout.flowStates?.includes(selectedInnovationFlowState);
    });

  const { t } = useTranslation();

  const handleSelectInnovationFlowState = (state: InnovationFlowState) => setSelectedInnovationFlowState(state);

  return (
    <>
      <MembershipBackdrop show={!loading && !callouts} blockName={t(`common.${journeyTypeName}` as const)}>
        <PageContent>
          <PageContentColumn columns={4}>
            <ContributeInnovationFlowBlock />
            <PageContentBlock>
              <PageContentBlockHeader
                title={t('pages.generic.sections.subentities.list', { entities: t('common.callouts') })}
              />
              <LinksList
                items={callouts?.map(callout => {
                  const CalloutIcon = calloutIcons[callout.type];
                  return {
                    id: callout.id,
                    title: <JourneyCalloutsListItemTitle callout={callout} />,
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
          </PageContentColumn>

          <PageContentColumn columns={8}>
            {innovationFlowStates && currentInnovationFlowState && selectedInnovationFlowState && (
              <InnovationFlowStates
                currentState={currentInnovationFlowState}
                selectedState={selectedInnovationFlowState}
                states={innovationFlowStates}
                onSelectState={handleSelectInnovationFlowState}
                showSettings
              />
            )}
            <CalloutsGroupView
              callouts={callouts}
              spaceId={spaceNameId!}
              canCreateCallout={canCreateCallout}
              loading={loading}
              journeyTypeName={journeyTypeName}
              sortOrder={calloutsSortOrder}
              calloutNames={calloutNames}
              onSortOrderUpdate={onCalloutsSortOrderUpdate}
              onCalloutUpdate={refetchCallout}
              scrollToCallout={scrollToCallout}
              displayLocation={CalloutDisplayLocation.Knowledge}
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

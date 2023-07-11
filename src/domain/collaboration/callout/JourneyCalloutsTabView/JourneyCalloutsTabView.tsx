import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import LinksList from '../../../../core/ui/list/LinksList';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CalloutCreationDialog from '../creation-dialog/CalloutCreationDialog';
import { useCalloutCreationWithPreviewImages } from '../creation-dialog/useCalloutCreation/useCalloutCreationWithPreviewImages';
import useCallouts, { TypedCallout } from '../useCallouts/useCallouts';
import EllipsableWithCount from '../../../../core/ui/typography/EllipsableWithCount';
import { ContributeCreationBlock } from '../../../challenge/common/tabs/Contribute/ContributeCreationBlock';
import calloutIcons from '../utils/calloutIcons';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import { useSpace } from '../../../challenge/space/SpaceContext/useSpace';
import {
  useCalloutFormTemplatesFromSpaceLazyQuery,
  useUpdateCalloutVisibilityMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import MembershipBackdrop from '../../../shared/components/Backdrops/MembershipBackdrop';
import { buildCalloutUrl } from '../../../../common/utils/urlBuilders';
import CalloutsGroupView from '../CalloutsInContext/CalloutsGroupView';
import { CalloutVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { CalloutsGroup } from '../CalloutsInContext/CalloutsGroup';
import InnovationFlowStates, {
  InnovationFlowState,
} from '../../InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import useStateWithAsyncDefault from '../../../../core/utils/useStateWithAsyncDefault';
import useInnovationFlowStates from '../../InnovationFlow/InnovationFlowStates/useInnovationFlowStates';

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
    innovationFlowState: selectedInnovationFlowState,
  });

  const callouts = allCallouts?.filter(callout => callout.group !== CalloutsGroup.HomeTop);

  const { t } = useTranslation();

  const buildCalloutTitle = (callout: TypedCallout) => {
    return <EllipsableWithCount count={callout.activity}>{callout.profile.displayName}</EllipsableWithCount>;
  };

  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCreateCallout,
    isCreating,
  } = useCalloutCreationWithPreviewImages();

  const { spaceId } = useSpace();

  const [fetchTemplates, { data: templatesData }] = useCalloutFormTemplatesFromSpaceLazyQuery({
    variables: { spaceId },
  });

  const postTemplates = templatesData?.space.templates?.postTemplates ?? [];
  const whiteboardTemplates = templatesData?.space.templates?.whiteboardTemplates ?? [];
  const templates = { postTemplates, whiteboardTemplates };

  const handleCreate = () => {
    fetchTemplates();
    handleCreateCalloutOpened();
  };

  const [updateCalloutVisibility] = useUpdateCalloutVisibilityMutation();
  const handleVisibilityChange = useCallback(
    async (calloutId: string, visibility: CalloutVisibility, sendNotification: boolean) => {
      await updateCalloutVisibility({
        variables: {
          calloutData: { calloutID: calloutId, visibility: visibility, sendNotification: sendNotification },
        },
      });
    },
    [updateCalloutVisibility]
  );

  const handleSelectInnovationFlowState = (state: InnovationFlowState) => setSelectedInnovationFlowState(state);

  return (
    <>
      <MembershipBackdrop show={!loading && !callouts} blockName={t(`common.${journeyTypeName}` as const)}>
        <PageContent>
          <PageContentColumn columns={4}>
            <ContributeCreationBlock canCreate={canCreateCallout} handleCreate={handleCreate} />
            <PageContentBlock>
              <PageContentBlockHeader
                title={t('pages.generic.sections.subentities.list', { entities: t('common.callouts') })}
              />
              <LinksList
                items={callouts?.map(callout => {
                  const CalloutIcon = calloutIcons[callout.type];
                  return {
                    id: callout.id,
                    title: buildCalloutTitle(callout),
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
              group={CalloutsGroup.KnowledgeBase}
            />
          </PageContentColumn>
        </PageContent>
      </MembershipBackdrop>
      <CalloutCreationDialog
        open={isCalloutCreationDialogOpen}
        onClose={handleCreateCalloutClosed}
        onSaveAsDraft={handleCreateCallout}
        onVisibilityChange={handleVisibilityChange}
        isCreating={isCreating}
        calloutNames={calloutNames}
        templates={templates}
        group={CalloutsGroup.KnowledgeBase}
      />
    </>
  );
};

export default JourneyCalloutsTabView;

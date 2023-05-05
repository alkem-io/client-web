import React, { PropsWithChildren, useCallback } from 'react';
import usePageLayoutByEntity from '../../shared/utils/usePageLayoutByEntity';
import { JourneyTypeName } from '../../challenge/JourneyTypeName';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import MembershipBackdrop from '../../shared/components/Backdrops/MembershipBackdrop';
import PageContent from '../../../core/ui/content/PageContent';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import { ContributeCreationBlock } from '../../challenge/common/tabs/Contribute/ContributeCreationBlock';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../core/ui/content/PageContentBlockHeader';
import LinksList from '../../../core/ui/list/LinksList';
import { buildCalloutUrl } from '../../../common/utils/urlBuilders';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import useCallouts, { TypedCallout } from '../callout/useCallouts/useCallouts';
import { useTranslation } from 'react-i18next';
import EllipsableWithCount from '../../../core/ui/typography/EllipsableWithCount';
import { useCalloutCreation } from '../callout/creation-dialog/useCalloutCreation/useCalloutCreation';
import { useHub } from '../../challenge/hub/HubContext/useHub';
import {
  useCalloutFormTemplatesFromHubLazyQuery,
  useUpdateCalloutVisibilityMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import { CalloutVisibility } from '../../../core/apollo/generated/graphql-schema';
import calloutIcons from '../callout/utils/calloutIcons';
import CalloutsGroupView from '../callout/CalloutsInContext/CalloutsGroupView';
import CalloutCreationDialog from '../callout/creation-dialog/CalloutCreationDialog';
import { CalloutsGroup } from '../callout/CalloutsInContext/CalloutsGroup';

interface KnowledgeBasePageProps {
  journeyTypeName: JourneyTypeName;
  scrollToCallout?: boolean;
}

const KnowledgeBasePage = ({ journeyTypeName, scrollToCallout = false }: PropsWithChildren<KnowledgeBasePageProps>) => {
  const PageLayout = usePageLayoutByEntity(journeyTypeName);
  const { hubNameId, challengeNameId, opportunityNameId } = useUrlParams();

  if (!hubNameId) {
    throw new Error('Must be within a Hub');
  }

  const {
    groupedCallouts,
    canCreateCallout,
    calloutNames,
    loading,
    calloutsSortOrder,
    onCalloutsSortOrderUpdate,
    refetchCallout,
  } = useCallouts({
    hubNameId,
    challengeNameId,
    opportunityNameId,
    calloutGroups: [CalloutsGroup.KnowledgeBase],
  });

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
  } = useCalloutCreation();

  const { hubId } = useHub();

  const [fetchTemplates, { data: templatesData }] = useCalloutFormTemplatesFromHubLazyQuery({
    variables: { hubId },
  });

  const postTemplates = templatesData?.hub.templates?.postTemplates ?? [];
  const whiteboardTemplates = templatesData?.hub.templates?.whiteboardTemplates ?? [];
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

  return (
    <PageLayout currentSection={EntityPageSection.KnowledgeBase}>
      <MembershipBackdrop
        show={!loading && !groupedCallouts[CalloutsGroup.KnowledgeBase]}
        blockName={t(`common.${journeyTypeName}` as const)}
      >
        <PageContent>
          <PageContentColumn columns={4}>
            <ContributeCreationBlock canCreate={canCreateCallout} handleCreate={handleCreate} />
            <PageContentBlock>
              <PageContentBlockHeader
                title={t('pages.generic.sections.subentities.list', { entities: t('common.callouts') })}
              />
              <LinksList
                items={groupedCallouts[CalloutsGroup.KnowledgeBase]?.map(callout => {
                  const CalloutIcon = calloutIcons[callout.type];
                  return {
                    id: callout.id,
                    title: buildCalloutTitle(callout),
                    icon: <CalloutIcon />,
                    uri: buildCalloutUrl(callout.nameID, {
                      hubNameId,
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
            <CalloutsGroupView
              callouts={groupedCallouts[CalloutsGroup.KnowledgeBase]}
              hubId={hubNameId!}
              canCreateCallout={canCreateCallout}
              loading={loading}
              entityTypeName="hub"
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
    </PageLayout>
  );
};

export default KnowledgeBasePage;

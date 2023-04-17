import React from 'react';
import { useTranslation } from 'react-i18next';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import LinksList from '../../../../core/ui/list/LinksList';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CalloutCreationDialog from '../creation-dialog/CalloutCreationDialog';
import { useCalloutCreation } from '../creation-dialog/useCalloutCreation/useCalloutCreation';
import useCallouts, { TypedCallout } from '../useCallouts/useCallouts';
import EllipsableWithCount from '../../../../core/ui/typography/EllipsableWithCount';
import { ContributeCreationBlock } from '../../../challenge/common/tabs/Contribute/ContributeCreationBlock';
import calloutIcons from '../utils/calloutIcons';
import { EntityTypeName } from '../../../platform/constants/EntityTypeName';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import { useCalloutFormTemplatesFromHubLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import MembershipBackdrop from '../../../shared/components/Backdrops/MembershipBackdrop';
import CalloutsView from './CalloutsView';
import { buildCalloutUrl } from '../../../../common/utils/urlBuilders';

interface JourneyCalloutsTabViewProps {
  entityTypeName: EntityTypeName;
  scrollToCallout?: boolean;
}

const JourneyCalloutsTabView = ({ entityTypeName, scrollToCallout }: JourneyCalloutsTabViewProps) => {
  const { hubNameId, challengeNameId, opportunityNameId } = useUrlParams();

  if (!hubNameId) {
    throw new Error('Must be within a Hub');
  }

  const { ungroupedCallouts, canCreateCallout, calloutNames, loading, calloutsSortOrder, onCalloutsSortOrderUpdate } =
    useCallouts({
      hubNameId,
      challengeNameId,
      opportunityNameId,
    });

  const { t } = useTranslation();

  const buildCalloutTitle = (callout: TypedCallout) => {
    return <EllipsableWithCount count={callout.activity}>{callout.profile.displayName}</EllipsableWithCount>;
  };

  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCalloutDrafted,
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

  return (
    <>
      <MembershipBackdrop show={!loading && !ungroupedCallouts} blockName={t(`common.${entityTypeName}` as const)}>
        <PageContent>
          <PageContentColumn columns={4}>
            <ContributeCreationBlock canCreate={canCreateCallout} handleCreate={handleCreate} />
            <PageContentBlock>
              <PageContentBlockHeader
                title={t('pages.generic.sections.subentities.list', { entities: t('common.callouts') })}
              />
              <LinksList
                items={ungroupedCallouts?.map(callout => {
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
                  parentEntity: t(`common.${entityTypeName}` as const),
                })}
                loading={loading}
              />
            </PageContentBlock>
          </PageContentColumn>

          <PageContentColumn columns={8}>
            <CalloutsView
              callouts={ungroupedCallouts}
              entityTypeName={entityTypeName}
              sortOrder={calloutsSortOrder}
              onSortOrderUpdate={onCalloutsSortOrderUpdate}
              calloutNames={calloutNames}
              scrollToCallout={scrollToCallout}
            />
          </PageContentColumn>
        </PageContent>
      </MembershipBackdrop>
      <CalloutCreationDialog
        open={isCalloutCreationDialogOpen}
        onClose={handleCreateCalloutClosed}
        onSaveAsDraft={handleCalloutDrafted}
        isCreating={isCreating}
        calloutNames={calloutNames}
        templates={templates}
      />
    </>
  );
};

export default JourneyCalloutsTabView;

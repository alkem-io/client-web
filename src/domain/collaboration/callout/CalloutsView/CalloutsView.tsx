import React, { useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import LinksList from '../../../../core/ui/list/LinksList';
import { AuthorizationPrivilege, CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import useScrollToElement from '../../../shared/utils/scroll/useScrollToElement';
import AspectCallout from '../aspect/AspectCallout';
import CanvasCallout from '../canvas/CanvasCallout';
import CommentsCallout from '../comments/CommentsCallout';
import CalloutCreationDialog from '../creation-dialog/CalloutCreationDialog';
import { useCalloutCreation } from '../creation-dialog/useCalloutCreation/useCalloutCreation';
import { useCalloutEdit } from '../edit/useCalloutEdit/useCalloutEdit';
import useCallouts, { TypedCallout } from '../useCallouts';
import EllipsableWithCount from '../../../../core/ui/typography/EllipsableWithCount';
import { ContributeCreationBlock } from '../../../challenge/common/tabs/Contribute/ContributeCreationBlock';
import calloutIcons from '../utils/calloutIcons';
import { Loading } from '../../../../common/components/core';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import { Caption } from '../../../../core/ui/typography';
import { EntityTypeName } from '../../../platform/constants/EntityTypeName';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import { useCalloutFormTemplatesFromHubLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import MembershipBackdrop from '../../../shared/components/Backdrops/MembershipBackdrop';
import { sortBy } from 'lodash';
import { CalloutSortEvents, CalloutSortProps } from '../Types';
import UpdateOrder from '../../../../core/utils/UpdateOrder';

interface CalloutsPageProps {
  entityTypeName: EntityTypeName;
  scrollToCallout?: boolean;
}

const getSortedCalloutIds = (callouts?: TypedCallout[]) => sortBy(callouts, c => c.sortOrder).map(c => c.id);

const CalloutsView = ({ entityTypeName, scrollToCallout = false }: CalloutsPageProps) => {
  const { hubNameId, challengeNameId, opportunityNameId, calloutNameId } = useUrlParams();

  const { callouts, canCreateCallout, getItemsCount, loading, updateCalloutsSortOrder } = useCallouts({
    hubNameId,
    challengeNameId,
    opportunityNameId,
  });

  const { t } = useTranslation();

  const buildCalloutTitle = (callout: TypedCallout) => {
    return <EllipsableWithCount count={getItemsCount(callout)}>{callout.profile.displayName}</EllipsableWithCount>;
  };

  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCalloutDrafted,
    isCreating,
  } = useCalloutCreation();

  const { hubId } = useHub();

  const [fetchTemplates, { data: templatesData }] = useCalloutFormTemplatesFromHubLazyQuery();
  const getTemplates = () => fetchTemplates({ variables: { hubId: hubId } });

  const postTemplates = templatesData?.hub.templates?.postTemplates ?? [];
  const whiteboardTemplates = templatesData?.hub.templates?.whiteboardTemplates ?? [];
  const templates = { postTemplates, whiteboardTemplates };

  const { handleEdit, handleVisibilityChange, handleDelete } = useCalloutEdit();

  const calloutNames = useMemo(() => (callouts ?? []).map(x => x.profile.displayName), [callouts]);

  // Scroll to Callout handler:
  const { scrollable } = useScrollToElement(calloutNameId, { enabled: scrollToCallout });

  const handleCreate = () => {
    getTemplates();
    handleCreateCalloutOpened();
  };

  const [sortedCalloutIds, setSortedCalloutIds] = useState(getSortedCalloutIds(callouts));

  useLayoutEffect(() => {
    setSortedCalloutIds(getSortedCalloutIds(callouts));
  }, [callouts]);

  const sortedCallouts = useMemo(
    () => sortedCalloutIds.map(id => callouts?.find(c => c.id === id)!),
    [sortedCalloutIds, callouts]
  );

  const updateOrder = UpdateOrder(setSortedCalloutIds, updateCalloutsSortOrder);

  const sortEvents: CalloutSortEvents = {
    onMoveToTop: updateOrder((ids, id) => ids.unshift(id)),
    onMoveToBottom: updateOrder((ids, id) => ids.push(id)),
    onMoveUp: updateOrder((ids, id, index) => ids.splice(index - 1, 0, id)),
    onMoveDown: updateOrder((ids, id, index) => ids.splice(index + 1, 0, id)),
  };

  return (
    <MembershipBackdrop show={!loading && !callouts} blockName={t(`common.${entityTypeName}` as const)}>
      <PageContent>
        <PageContentColumn columns={4}>
          <ContributeCreationBlock canCreate={canCreateCallout} handleCreate={handleCreate} />
          <PageContentBlock>
            <PageContentBlockHeader
              title={t('pages.generic.sections.subentities.list', { entities: t('common.callouts') })}
            />
            <LinksList
              items={sortedCallouts?.map(callout => {
                const CalloutIcon = calloutIcons[callout.type];
                return {
                  id: callout.id,
                  title: buildCalloutTitle(callout),
                  icon: <CalloutIcon />,
                  uri: callout.url,
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
          {loading && <Loading />}
          {!loading && callouts?.length === 0 && (
            <PageContentBlockSeamless textAlign="center">
              <Caption>
                {t('pages.generic.sections.subentities.empty', {
                  entities: t('common.callouts'),
                  parentEntity: t(`common.${entityTypeName}` as const),
                })}
              </Caption>
            </PageContentBlockSeamless>
          )}
          {!loading &&
            sortedCallouts?.map((callout, index) => {
              const sortProps: CalloutSortProps = {
                topCallout: index === 0,
                bottomCallout: index === sortedCallouts.length - 1,
              };

              return (callout => {
                switch (callout.type) {
                  case CalloutType.Card:
                    return (
                      <AspectCallout
                        key={callout.id}
                        ref={scrollable(callout.nameID)}
                        callout={callout}
                        calloutNames={calloutNames}
                        contributionsCount={getItemsCount(callout)}
                        hubNameId={hubNameId!}
                        challengeNameId={challengeNameId}
                        opportunityNameId={opportunityNameId}
                        canCreate={callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateAspect)}
                        onCalloutEdit={handleEdit}
                        onVisibilityChange={handleVisibilityChange}
                        onCalloutDelete={handleDelete}
                        {...sortEvents}
                        {...sortProps}
                      />
                    );
                  case CalloutType.Canvas:
                    return (
                      <CanvasCallout
                        key={callout.id}
                        ref={scrollable(callout.nameID)}
                        callout={callout}
                        calloutNames={calloutNames}
                        contributionsCount={getItemsCount(callout)}
                        hubNameId={hubNameId!}
                        challengeNameId={challengeNameId}
                        opportunityNameId={opportunityNameId}
                        canCreate={callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateCanvas)}
                        onCalloutEdit={handleEdit}
                        onVisibilityChange={handleVisibilityChange}
                        onCalloutDelete={handleDelete}
                        {...sortEvents}
                        {...sortProps}
                      />
                    );
                  case CalloutType.Comments:
                    return (
                      <CommentsCallout
                        key={callout.id}
                        ref={scrollable(callout.nameID)}
                        callout={callout}
                        calloutNames={calloutNames}
                        contributionsCount={getItemsCount(callout)}
                        hubNameId={hubNameId!}
                        challengeNameId={challengeNameId}
                        opportunityNameId={opportunityNameId}
                        onCalloutEdit={handleEdit}
                        onVisibilityChange={handleVisibilityChange}
                        onCalloutDelete={handleDelete}
                        isSubscribedToComments={callout.isSubscribedToComments}
                        {...sortEvents}
                        {...sortProps}
                      />
                    );
                  default:
                    throw new Error('Unexpected Callout type');
                }
              })(callout);
            })}
          <CalloutCreationDialog
            open={isCalloutCreationDialogOpen}
            onClose={handleCreateCalloutClosed}
            onSaveAsDraft={handleCalloutDrafted}
            isCreating={isCreating}
            calloutNames={calloutNames}
            templates={templates}
          />
        </PageContentColumn>
      </PageContent>
    </MembershipBackdrop>
  );
};

export default CalloutsView;

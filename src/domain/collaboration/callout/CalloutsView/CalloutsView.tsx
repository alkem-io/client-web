import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ForumOutlined } from '@mui/icons-material';
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
import { AspectIcon } from '../../aspect/icon/AspectIcon';
import { CanvasAltIcon } from '../../canvas/icon/CanvasAltIcon';
import CalloutsListTitle from './CalloutsListTitle';
import { ContributeCreationBlock } from '../../../challenge/common/tabs/Contribute/ContributeCreationBlock';
import { gutters } from '../../../../core/ui/grid/utils';

interface CalloutsPageProps {
  scrollToCallout?: boolean;
}

const calloutIcons = {
  [CalloutType.Card]: <AspectIcon />,
  [CalloutType.Canvas]: <CanvasAltIcon />,
  [CalloutType.Comments]: <ForumOutlined />,
} as const;

const CalloutsView = ({ scrollToCallout = false }: CalloutsPageProps) => {
  const { hubNameId, challengeNameId, opportunityNameId, calloutNameId } = useUrlParams();

  const { callouts, canCreateCallout, getItemsCount, loading } = useCallouts({
    hubNameId,
    challengeNameId,
    opportunityNameId,
  });

  const { t } = useTranslation();

  const buildCalloutTitle = (callout: TypedCallout) => {
    return (
      <CalloutsListTitle
        displayName={callout.displayName}
        contributionsCount={getItemsCount(callout)}
        calloutUrl={callout.url}
      />
    );
  };

  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCalloutDrafted,
    isCreating,
  } = useCalloutCreation();

  const { handleEdit, handleVisibilityChange, handleDelete } = useCalloutEdit();

  const calloutNames = useMemo(() => (callouts ?? []).map(x => x.displayName), [callouts]);

  // Scroll to Callout handler:
  const onElementAdded = useScrollToElement(calloutNameId, scrollToCallout);

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <ContributeCreationBlock canCreate={canCreateCallout} handleCreate={handleCreateCalloutOpened} />
        <PageContentBlock>
          <PageContentBlockHeader
            title={t('pages.generic.sections.subentities.list', { entities: t('common.callouts') })}
          />
          <LinksList
            items={callouts?.map(callout => ({
              id: callout.id,
              title: buildCalloutTitle(callout),
              icon: calloutIcons[callout.type],
            }))}
            emptyListCaption={t('pages.generic.sections.subentities.empty-list', {
              entities: t('common.callouts'),
              parentEntity: opportunityNameId
                ? t('common.opportunity')
                : challengeNameId
                ? t('common.challenge')
                : t('common.hub'),
            })}
          />
        </PageContentBlock>
      </PageContentColumn>

      <PageContentColumn columns={8}>
        <Box display="flex" flexDirection="column" gap={gutters()}>
          {callouts?.map(callout => {
            return (callout => {
              switch (callout.type) {
                case CalloutType.Card:
                  return (
                    <AspectCallout
                      key={callout.id}
                      ref={element => onElementAdded(element, callout.nameID)}
                      callout={callout}
                      calloutNames={calloutNames}
                      contributionsCount={getItemsCount(callout)}
                      loading={loading}
                      hubNameId={hubNameId!}
                      challengeNameId={challengeNameId}
                      opportunityNameId={opportunityNameId}
                      canCreate={callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateAspect)}
                      onCalloutEdit={handleEdit}
                      onVisibilityChange={handleVisibilityChange}
                      onCalloutDelete={handleDelete}
                    />
                  );
                case CalloutType.Canvas:
                  return (
                    <CanvasCallout
                      key={callout.id}
                      ref={element => onElementAdded(element, callout.nameID)}
                      callout={callout}
                      calloutNames={calloutNames}
                      contributionsCount={getItemsCount(callout)}
                      loading={loading}
                      hubNameId={hubNameId!}
                      challengeNameId={challengeNameId}
                      opportunityNameId={opportunityNameId}
                      canCreate={callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreateCanvas)}
                      onCalloutEdit={handleEdit}
                      onVisibilityChange={handleVisibilityChange}
                      onCalloutDelete={handleDelete}
                    />
                  );
                case CalloutType.Comments:
                  return (
                    <CommentsCallout
                      key={callout.id}
                      ref={element => onElementAdded(element, callout.nameID)}
                      callout={callout}
                      calloutNames={calloutNames}
                      contributionsCount={getItemsCount(callout)}
                      loading={loading}
                      hubNameId={hubNameId!}
                      challengeNameId={challengeNameId}
                      opportunityNameId={opportunityNameId}
                      onCalloutEdit={handleEdit}
                      onVisibilityChange={handleVisibilityChange}
                      onCalloutDelete={handleDelete}
                      isSubscribedToComments={callout.isSubscribedToComments}
                    />
                  );
                default:
                  throw new Error('Unexpected Callout type');
              }
            })(callout);
          })}
        </Box>
        <CalloutCreationDialog
          open={isCalloutCreationDialogOpen}
          onClose={handleCreateCalloutClosed}
          onSaveAsDraft={handleCalloutDrafted}
          isCreating={isCreating}
          calloutNames={calloutNames}
        />
      </PageContentColumn>
    </PageContent>
  );
};

export default CalloutsView;

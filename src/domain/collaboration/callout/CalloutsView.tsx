import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { Box, Button } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PageContent from '../../../core/ui/content/PageContent';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../core/ui/content/PageContentBlockHeader';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import LinksList from '../../../core/ui/list/LinksList';
import { RouterLink } from '../../../common/components/core/RouterLink';
import { AuthorizationPrivilege, CalloutType } from '../../../core/apollo/generated/graphql-schema';
import { INSPIRATION_ROUTE } from '../../../core/routing/route.constants';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import useScrollToElement from '../../shared/utils/scroll/useScrollToElement';
import useBackToParentPage from '../../shared/utils/useBackToParentPage';
import AspectCallout from './aspect/AspectCallout';
import CanvasCallout from './canvas/CanvasCallout';
import CommentsCallout from './comments/CommentsCallout';
import CalloutCreationDialog from './creation-dialog/CalloutCreationDialog';
import { useCalloutCreation } from './creation-dialog/useCalloutCreation/useCalloutCreation';
import { useCalloutEdit } from './edit/useCalloutEdit/useCalloutEdit';
import useCallouts from './useCallouts';
import { AspectIcon } from '../aspect/icon/AspectIcon';
import { CanvasAltIcon } from '../canvas/icon/CanvasAltIcon';
import { ForumOutlined } from '@mui/icons-material';

interface CalloutsPageProps {
  rootUrl: string;
  scrollToCallout?: boolean;
}

const CalloutsView = ({ rootUrl, scrollToCallout = false }: CalloutsPageProps) => {
  const { hubNameId, challengeNameId, opportunityNameId, calloutNameId } = useUrlParams();

  const { callouts, canCreateCallout, getItemsCount, loading } = useCallouts({
    hubNameId,
    challengeNameId,
    opportunityNameId,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [/* use for the Dialog */ backToCanvases, buildLinkToCanvasRaw] = useBackToParentPage(rootUrl);

  const { t } = useTranslation();

  const calloutIcons = useMemo(
    () => ({
      [CalloutType.Card]: <AspectIcon />,
      [CalloutType.Canvas]: <CanvasAltIcon />,
      [CalloutType.Comments]: <ForumOutlined />,
    }),
    []
  );

  const buildCalloutTitle = useCallback(
    callout => `${callout.displayName} (${getItemsCount(callout)})`,
    [getItemsCount]
  );

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
  const addElement = useScrollToElement(scrollToCallout, calloutNameId);

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <PageContentBlock>
          <PageContentBlockHeader
            title={t('pages.generic.sections.subentities.list', { entities: t('common.callouts') })}
          />
          <LinksList
            items={callouts?.map(callout => ({
              id: callout.id,
              title: buildCalloutTitle(callout),
              url: callout.url,
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
        {canCreateCallout && (
          <Box display="flex" justifyContent="end" mb={1} gap={1}>
            <Button
              variant="text"
              startIcon={<TipsAndUpdatesOutlinedIcon />}
              target="_blank"
              rel="noopener noreferrer"
              component={RouterLink}
              to={INSPIRATION_ROUTE}
            >
              {t('common.inspiration')}
            </Button>
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={handleCreateCalloutOpened}>
              {t('common.create')}
            </Button>
          </Box>
        )}
        <Box display="flex" flexDirection="column" gap={3.5}>
          {callouts?.map(callout => {
            return (
              <React.Fragment key={callout.nameID}>
                <div id={`callout-${callout.nameID}`} ref={element => addElement(callout.nameID, element)} />
                {(callout => {
                  switch (callout.type) {
                    case CalloutType.Card:
                      return (
                        <AspectCallout
                          key={callout.id}
                          callout={callout}
                          calloutNames={calloutNames}
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
                          callout={callout}
                          calloutNames={calloutNames}
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
                          callout={callout}
                          calloutNames={calloutNames}
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
                })(callout)}
              </React.Fragment>
            );
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

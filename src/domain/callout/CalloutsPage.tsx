import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import usePageLayoutByEntity from '../shared/utils/usePageLayoutByEntity';
import { EntityTypeName } from '../shared/layout/PageLayout/SimplePageLayout';
import { EntityPageSection } from '../shared/layout/EntityPageSection';
import useBackToParentPage from '../shared/utils/useBackToParentPage';
import { useUrlParams } from '../../hooks';
import { AuthorizationPrivilege, CalloutType } from '../../models/graphql-schema';
import { useCalloutCreation } from './creation-dialog/useCalloutCreation/useCalloutCreation';
import CalloutCreationDialog from './creation-dialog/CalloutCreationDialog';
import { useCalloutEdit } from './edit/useCalloutEdit/useCalloutEdit';
import AspectCallout from './aspect/AspectCallout';
import CanvasCallout from './canvas/CanvasCallout';
import CommentsCallout from './comments/CommentsCallout';
import useCallouts from './useCallouts';

interface CalloutsPageProps {
  entityTypeName: EntityTypeName;
  rootUrl: string;
}

const CalloutsPage = ({ entityTypeName, rootUrl }: CalloutsPageProps) => {
  const { hubNameId, challengeNameId, opportunityNameId } = useUrlParams();

  const PageLayout = usePageLayoutByEntity(entityTypeName);

  const { callouts, canCreateCallout, loading } = useCallouts({ hubNameId, challengeNameId, opportunityNameId });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [/* use for the Dialog */ backToCanvases, buildLinkToCanvasRaw] = useBackToParentPage(rootUrl);

  const buildLinkToCanvas = useMemo(
    () => (canvasNameId: string, calloutNameId: string) =>
      buildLinkToCanvasRaw(`${rootUrl}/callouts/${calloutNameId}/canvases/${canvasNameId}`),
    [rootUrl, buildLinkToCanvasRaw]
  );

  const { t } = useTranslation();

  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCalloutDrafted,
    isCreating,
  } = useCalloutCreation();

  const { handleEdit, handleVisibilityChange, handleDelete } = useCalloutEdit();

  return (
    <>
      <PageLayout currentSection={EntityPageSection.Explore}>
        <Box display="flex" flexDirection="column" gap={3.5}>
          {canCreateCallout && (
            <Button variant="contained" sx={{ alignSelf: 'end' }} onClick={handleCreateCalloutOpened}>
              {t('common.create-new-entity', { entity: t('common.callout') })}
            </Button>
          )}
          {callouts?.map(callout => {
            switch (callout.type) {
              case CalloutType.Card:
                return (
                  <AspectCallout
                    key={callout.id}
                    callout={callout}
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
                    loading={loading}
                    hubNameId={hubNameId!}
                    challengeNameId={challengeNameId}
                    opportunityNameId={opportunityNameId}
                    buildCanvasUrl={buildLinkToCanvas}
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
          })}
        </Box>
      </PageLayout>
      <CalloutCreationDialog
        open={isCalloutCreationDialogOpen}
        onClose={handleCreateCalloutClosed}
        onSaveAsDraft={handleCalloutDrafted}
        isCreating={isCreating}
      />
    </>
  );
};

export default CalloutsPage;

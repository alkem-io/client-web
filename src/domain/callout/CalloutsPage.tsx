import React, { useMemo } from 'react';
import usePageLayoutByEntity from '../shared/utils/usePageLayoutByEntity';
import { EntityTypeName } from '../shared/layout/PageLayout/SimplePageLayout';
import { EntityPageSection } from '../shared/layout/EntityPageSection';
import { useUrlParams } from '../../hooks';
import useCallouts from './useCallouts';
import { Box, Button } from '@mui/material';
import AspectCallout from './aspect/AspectCallout';
import { AuthorizationPrivilege, CalloutType } from '../../models/graphql-schema';
import CanvasCallout from './canvas/CanvasCallout';
import useBackToParentPage from '../shared/utils/useBackToParentPage';
import { useTranslation } from 'react-i18next';
import { useCalloutCreation } from './creation-dialog/useCalloutCreation/useCalloutCreation';
import CalloutCreationDialog from './creation-dialog/CalloutCreationDialog';

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
    () => (url: string) => buildLinkToCanvasRaw(`${rootUrl}/${url}`),
    [rootUrl, buildLinkToCanvasRaw]
  );

  const { t } = useTranslation();

  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCalloutPublished,
    handleCalloutDrafted,
    isPublishing,
  } = useCalloutCreation();

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
        onPublish={handleCalloutPublished}
        onSaveAsDraft={handleCalloutDrafted}
        isPublishing={isPublishing}
      />
    </>
  );
};

export default CalloutsPage;

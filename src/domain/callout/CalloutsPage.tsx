import React, { useMemo } from 'react';
import usePageLayoutByEntity from '../shared/utils/usePageLayoutByEntity';
import { EntityTypeName } from '../shared/layout/PageLayout/SimplePageLayout';
import { EntityPageSection } from '../shared/layout/EntityPageSection';
import { useUrlParams } from '../../hooks';
import useCallouts from './useCallouts';
import { Box, Button } from '@mui/material';
import AspectCallout from './AspectCallout';
import { CalloutType } from '../../models/graphql-schema';
import CanvasCallout from './CanvasCallout';
import useBackToParentPage from '../shared/utils/useBackToParentPage';
import { useTranslation } from 'react-i18next';

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

  return (
    <PageLayout currentSection={EntityPageSection.Explore}>
      <Box display="flex" flexDirection="column" gap={3.5}>
        {canCreateCallout && (
          <Button variant="contained" sx={{ alignSelf: 'end' }}>
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
                />
              );
            case CalloutType.Canvas:
              return <CanvasCallout key={callout.id} callout={callout} buildCanvasUrl={buildLinkToCanvas} />;
            default:
              throw new Error('Unexpected Callout type');
          }
        })}
      </Box>
    </PageLayout>
  );
};

export default CalloutsPage;

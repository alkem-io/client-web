import React, { useState, Suspense, useMemo, useCallback } from 'react';
import AddContentButton from '@/core/ui/content/AddContentButton';
import CalloutsView, { CalloutsViewProps } from '../CalloutsView/CalloutsView';
import { useTranslation } from 'react-i18next';
import { buildFlowStateClassificationTagsets } from '../Classification/ClassificationTagset.utils';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';

interface CalloutsGroupProps extends CalloutsViewProps {
  calloutsSetId: string | undefined;
  canCreateCallout: boolean;
  createInFlowState?: string;
  createButtonPlace?: 'top' | 'bottom';
}

const CreateCalloutDialog = lazyWithGlobalErrorHandler(
  () => import('@/domain/collaboration/callout/CalloutDialogs/CreateCalloutDialog')
);

const CalloutsGroupView = ({
  canCreateCallout,
  createInFlowState,
  createButtonPlace = 'bottom',
  calloutsSetId,
  ...calloutsViewProps
}: CalloutsGroupProps) => {
  const { t } = useTranslation();
  const [isCalloutCreationDialogOpen, setIsCalloutCreationDialogOpen] = useState(false);
  const handleOpenDialog = useCallback(() => setIsCalloutCreationDialogOpen(true), []);
  const handleCloseDialog = useCallback(() => setIsCalloutCreationDialogOpen(false), []);

  const createButton = useMemo(
    () => (
      <AddContentButton onClick={handleOpenDialog} title={t('callout.create.createButtonTooltip')}>
        {t('callout.create.createButton')}
      </AddContentButton>
    ),
    [t, handleOpenDialog]
  );

  return (
    <>
      {canCreateCallout && createButtonPlace === 'top' && createButton}
      <CalloutsView {...calloutsViewProps} calloutsSetId={calloutsSetId} />
      {canCreateCallout && createButtonPlace === 'bottom' && createButton}
      <Suspense fallback={null}>
        <CreateCalloutDialog
          open={isCalloutCreationDialogOpen}
          onClose={handleCloseDialog}
          calloutsSetId={calloutsSetId}
          calloutClassification={buildFlowStateClassificationTagsets(createInFlowState || '')}
          calloutRestrictions={calloutsViewProps.calloutRestrictions}
        />
      </Suspense>
    </>
  );
};

export default CalloutsGroupView;

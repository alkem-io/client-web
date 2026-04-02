import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import AddContentButton from '@/core/ui/content/AddContentButton';
import CalloutsView, { type CalloutsViewProps } from '../CalloutsView/CalloutsView';
import { buildFlowStateClassificationTagsets } from '../Classification/ClassificationTagset.utils';

interface CalloutsGroupProps extends CalloutsViewProps {
  calloutsSetId: string | undefined;
  canCreateCallout: boolean;
  createInFlowState?: string;
  createButtonPlace?: 'top' | 'bottom';
  defaultTemplateId?: string;
}

const CreateCalloutDialog = lazyWithGlobalErrorHandler(
  () => import('@/domain/collaboration/callout/CalloutDialogs/CreateCalloutDialog')
);

const CalloutsGroupView = ({
  canCreateCallout,
  createInFlowState,
  createButtonPlace = 'top',
  calloutsSetId,
  defaultTemplateId,
  ...calloutsViewProps
}: CalloutsGroupProps) => {
  const { t } = useTranslation();
  const [isCalloutCreationDialogOpen, setIsCalloutCreationDialogOpen] = useState(false);
  const handleOpenDialog = () => setIsCalloutCreationDialogOpen(true);
  const handleCloseDialog = () => setIsCalloutCreationDialogOpen(false);

  const createButton = (
    <AddContentButton onClick={handleOpenDialog} title={t('callout.create.createButtonTooltip')}>
      {t('callout.create.createButton')}
    </AddContentButton>
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
          defaultTemplateId={defaultTemplateId}
        />
      </Suspense>
    </>
  );
};

export default CalloutsGroupView;

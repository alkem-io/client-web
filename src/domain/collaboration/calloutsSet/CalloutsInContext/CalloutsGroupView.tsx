import { useState } from 'react';
import CalloutCreationDialog from '../../callout/creationDialog/CalloutCreationDialog';
import { useCalloutCreationWithPreviewImages } from '../useCalloutCreation/useCalloutCreationWithPreviewImages';
import AddContentButton from '@/core/ui/content/AddContentButton';
import CalloutsView, { CalloutsViewProps } from '../CalloutsView/CalloutsView';
import { CalloutType } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';

interface CalloutsGroupProps extends CalloutsViewProps {
  calloutsSetId: string | undefined;
  canCreateCallout: boolean;
  createInFlowState?: string;
  createButtonPlace?: 'top' | 'bottom';
  availableCalloutTypes?: CalloutType[];
}

const CalloutsGroupView = ({
  canCreateCallout,
  createInFlowState,
  createButtonPlace = 'bottom',
  calloutsSetId,
  availableCalloutTypes,
  disableRichMedia,
  disablePostResponses,
  ...calloutsViewProps
}: CalloutsGroupProps) => {
  const { t } = useTranslation();
  const [isCalloutCreationDialogOpen, setIsCalloutCreationDialogOpen] = useState(false);
  const { handleCreateCallout, loading } = useCalloutCreationWithPreviewImages({ calloutsSetId });

  const createButton = (
    <AddContentButton
      onClick={() => setIsCalloutCreationDialogOpen(true)}
      title={t('callout.create.createButtonTooltip')}
    >
      {t('callout.create.createButton')}
    </AddContentButton>
  );

  return (
    <>
      {canCreateCallout && createButtonPlace === 'top' && createButton}
      <CalloutsView
        disableRichMedia={disableRichMedia}
        disablePostResponses={disablePostResponses}
        {...calloutsViewProps}
      />
      {canCreateCallout && createButtonPlace === 'bottom' && createButton}
      <CalloutCreationDialog
        open={isCalloutCreationDialogOpen}
        onClose={() => setIsCalloutCreationDialogOpen(false)}
        onCreateCallout={handleCreateCallout}
        loading={loading}
        flowState={createInFlowState}
        availableCalloutTypes={availableCalloutTypes}
        disableRichMedia={disableRichMedia}
        disablePostResponses={disablePostResponses}
      />
    </>
  );
};

export default CalloutsGroupView;

import { useState } from 'react';
import AddContentButton from '@/core/ui/content/AddContentButton';
import CalloutsView, { CalloutsViewProps } from '../CalloutsView/CalloutsView';
import { useTranslation } from 'react-i18next';
import CreateCalloutDialog from '../../callout/CalloutDialogs/CreateCalloutDialog';
import { buildFlowStateClassificationTagsets } from '../Classification/ClassificationTagset.utils';

interface CalloutsGroupProps extends CalloutsViewProps {
  calloutsSetId: string | undefined;
  canCreateCallout: boolean;
  createInFlowState?: string;
  createButtonPlace?: 'top' | 'bottom';
}

const CalloutsGroupView = ({
  canCreateCallout,
  createInFlowState,
  createButtonPlace = 'bottom',
  calloutsSetId,
  ...calloutsViewProps
}: CalloutsGroupProps) => {
  const { t } = useTranslation();
  const [isCalloutCreationDialogOpen, setIsCalloutCreationDialogOpen] = useState(false);

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
      <CalloutsView {...calloutsViewProps} />
      {canCreateCallout && createButtonPlace === 'bottom' && createButton}
      <CreateCalloutDialog
        open={isCalloutCreationDialogOpen}
        onClose={() => setIsCalloutCreationDialogOpen(false)}
        calloutsSetId={calloutsSetId}
        calloutClassification={buildFlowStateClassificationTagsets(createInFlowState)}
        calloutRestrictions={calloutsViewProps.calloutRestrictions}
      />
    </>
  );
};

export default CalloutsGroupView;

import CalloutCreationDialog from '../../callout/creationDialog/CalloutCreationDialog';
import { useCalloutCreationWithPreviewImages } from '../useCalloutCreation/useCalloutCreationWithPreviewImages';
import AddContentButton from '@/core/ui/content/AddContentButton';
import CalloutsView, { CalloutsViewProps } from '../JourneyCalloutsTabView/CalloutsView';
import { CalloutGroupName } from '@/core/apollo/generated/graphql-schema';
import { useColumns } from '@/core/ui/grid/GridContext';
import { useTranslation } from 'react-i18next';

interface CalloutsGroupProps extends CalloutsViewProps {
  journeyId: string | undefined;
  calloutsSetId: string | undefined;
  canCreateCallout: boolean;
  groupName: CalloutGroupName;
  flowState?: string;
  createButtonPlace?: 'top' | 'bottom';
}

const CalloutsGroupView = ({
  journeyId,
  canCreateCallout,
  groupName,
  flowState,
  createButtonPlace = 'bottom',
  journeyTypeName,
  calloutsSetId,
  ...calloutsViewProps
}: CalloutsGroupProps) => {
  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCreateCallout,
    loading,
  } = useCalloutCreationWithPreviewImages({ calloutsSetId });

  const handleCreate = () => {
    handleCreateCalloutOpened();
  };

  const columns = useColumns();

  const { t } = useTranslation();

  const createButton = (
    <AddContentButton onClick={handleCreate}>
      {columns > 4 ? t('callout.createFull') : t('common.add')}
    </AddContentButton>
  );

  return (
    <>
      {canCreateCallout && createButtonPlace === 'top' && createButton}
      <CalloutsView journeyTypeName={journeyTypeName} {...calloutsViewProps} />
      {canCreateCallout && createButtonPlace === 'bottom' && createButton}
      <CalloutCreationDialog
        open={isCalloutCreationDialogOpen}
        onClose={handleCreateCalloutClosed}
        onCreateCallout={handleCreateCallout}
        loading={loading}
        groupName={groupName}
        flowState={flowState}
        journeyTypeName={journeyTypeName}
      />
    </>
  );
};

export default CalloutsGroupView;

import React from 'react';
import CalloutCreationDialog from '../creationDialog/CalloutCreationDialog';
import { useCalloutCreationWithPreviewImages } from '../creationDialog/useCalloutCreation/useCalloutCreationWithPreviewImages';
import AddContentButton from '../../../../core/ui/content/AddContentButton';
import CalloutsView, { CalloutsViewProps } from '../JourneyCalloutsTabView/CalloutsView';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import { useColumns } from '../../../../core/ui/grid/GridContext';
import { useTranslation } from 'react-i18next';

interface CalloutsGroupProps extends CalloutsViewProps {
  spaceId: string;
  canCreateCallout: boolean;
  canCreateCalloutFromTemplate: boolean;
  groupName: CalloutGroupName;
  flowState?: string;
  createButtonPlace?: 'top' | 'bottom';
}

const CalloutsGroupView = ({
  spaceId,
  calloutNames,
  canCreateCallout,
  canCreateCalloutFromTemplate,
  groupName,
  flowState,
  createButtonPlace = 'bottom',
  journeyTypeName,
  ...calloutsViewProps
}: CalloutsGroupProps) => {
  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCreateCallout,
    loading,
  } = useCalloutCreationWithPreviewImages();

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
      <CalloutsView calloutNames={calloutNames} journeyTypeName={journeyTypeName} {...calloutsViewProps} />
      {canCreateCallout && createButtonPlace === 'bottom' && createButton}
      <CalloutCreationDialog
        open={isCalloutCreationDialogOpen}
        onClose={handleCreateCalloutClosed}
        onCreateCallout={handleCreateCallout}
        loading={loading}
        calloutNames={calloutNames}
        groupName={groupName}
        flowState={flowState}
        journeyTypeName={journeyTypeName}
        canCreateCalloutFromTemplate={canCreateCalloutFromTemplate}
      />
    </>
  );
};

export default CalloutsGroupView;

import React, { useCallback } from 'react';
import CalloutCreationDialog from '../creation-dialog/CalloutCreationDialog';
import { useCalloutCreationWithPreviewImages } from '../creation-dialog/useCalloutCreation/useCalloutCreationWithPreviewImages';
import AddContentButton from '../../../../core/ui/content/AddContentButton';
import CalloutsView, { CalloutsViewProps } from '../JourneyCalloutsTabView/CalloutsView';
import {
  useCalloutFormTemplatesFromSpaceLazyQuery,
  useUpdateCalloutVisibilityMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { CalloutVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { useColumns } from '../../../../core/ui/grid/GridContext';
import { useTranslation } from 'react-i18next';

interface CalloutsGroupProps extends CalloutsViewProps {
  spaceId: string;
  canCreateCallout: boolean;
  group: string;
  createButtonPlace?: 'top' | 'bottom';
}

const CalloutsGroupView = ({
  spaceId,
  calloutNames,
  canCreateCallout,
  group,
  createButtonPlace = 'bottom',
  ...calloutsViewProps
}: CalloutsGroupProps) => {
  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCreateCallout,
    isCreating,
  } = useCalloutCreationWithPreviewImages();

  const [fetchTemplates, { data: templatesData }] = useCalloutFormTemplatesFromSpaceLazyQuery();
  const getTemplates = () => fetchTemplates({ variables: { spaceId: spaceId } });

  const postTemplates = templatesData?.space.templates?.postTemplates ?? [];
  const whiteboardTemplates = templatesData?.space.templates?.whiteboardTemplates ?? [];
  const templates = { postTemplates, whiteboardTemplates };

  const handleCreate = () => {
    getTemplates();
    handleCreateCalloutOpened();
  };

  const [updateCalloutVisibility] = useUpdateCalloutVisibilityMutation();
  const handleVisibilityChange = useCallback(
    async (calloutId: string, visibility: CalloutVisibility, sendNotification: boolean) => {
      await updateCalloutVisibility({
        variables: {
          calloutData: { calloutID: calloutId, visibility: visibility, sendNotification: sendNotification },
        },
      });
    },
    [updateCalloutVisibility]
  );

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
      <CalloutsView calloutNames={calloutNames} {...calloutsViewProps} />
      {canCreateCallout && createButtonPlace === 'bottom' && createButton}
      <CalloutCreationDialog
        open={isCalloutCreationDialogOpen}
        onClose={handleCreateCalloutClosed}
        onSaveAsDraft={handleCreateCallout}
        onVisibilityChange={handleVisibilityChange}
        isCreating={isCreating}
        calloutNames={calloutNames}
        templates={templates}
        group={group}
      />
    </>
  );
};

export default CalloutsGroupView;

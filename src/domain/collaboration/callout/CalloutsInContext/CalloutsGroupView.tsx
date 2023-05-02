import React, { useCallback } from 'react';
import CalloutCreationDialog from '../creation-dialog/CalloutCreationDialog';
import { useCalloutCreation } from '../creation-dialog/useCalloutCreation/useCalloutCreation';
import AddContentButton from '../../../../core/ui/content/AddContentButton';
import CalloutsView, { CalloutsViewProps } from '../JourneyCalloutsTabView/CalloutsView';
import {
  useCalloutFormTemplatesFromHubLazyQuery,
  useUpdateCalloutVisibilityMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { CalloutVisibility } from '../../../../core/apollo/generated/graphql-schema';

interface CalloutsGroupProps extends CalloutsViewProps {
  hubId: string;
  canCreateCallout: boolean;
  group: string;
}

const CalloutsGroupView = ({
  callouts,
  hubId,
  entityTypeName,
  calloutNames,
  scrollToCallout,
  sortOrder,
  loading,
  onSortOrderUpdate,
  canCreateCallout,
  group,
  blockProps,
}: CalloutsGroupProps) => {
  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCreateCallout,
    isCreating,
  } = useCalloutCreation();

  const [fetchTemplates, { data: templatesData }] = useCalloutFormTemplatesFromHubLazyQuery();
  const getTemplates = () => fetchTemplates({ variables: { hubId: hubId } });

  const postTemplates = templatesData?.hub.templates?.postTemplates ?? [];
  const whiteboardTemplates = templatesData?.hub.templates?.whiteboardTemplates ?? [];
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

  return (
    <>
      <CalloutsView
        callouts={callouts}
        entityTypeName={entityTypeName}
        sortOrder={sortOrder}
        calloutNames={calloutNames}
        scrollToCallout={scrollToCallout}
        loading={loading}
        onSortOrderUpdate={onSortOrderUpdate}
        blockProps={blockProps}
      />
      {canCreateCallout && <AddContentButton onClick={handleCreate} />}
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

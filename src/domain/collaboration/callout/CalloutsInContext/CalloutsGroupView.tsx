import React from 'react';
import CalloutCreationDialog from '../creation-dialog/CalloutCreationDialog';
import { useCalloutCreation } from '../creation-dialog/useCalloutCreation/useCalloutCreation';
import AddContentButton from '../../../../core/ui/content/AddContentButton';
import CalloutsView, { CalloutsViewProps } from '../JourneyCalloutsTabView/CalloutsView';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import { useCalloutFormTemplatesFromHubLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';

interface CalloutsGroupProps extends CalloutsViewProps {
  canCreateCallout: boolean;
}

const CalloutsGroupView = ({
  callouts,
  entityTypeName,
  calloutNames,
  scrollToCallout,
  sortOrder,
  loading,
  onSortOrderUpdate,
  canCreateCallout,
}: CalloutsGroupProps) => {
  const {
    isCalloutCreationDialogOpen,
    handleCreateCalloutOpened,
    handleCreateCalloutClosed,
    handleCalloutDrafted,
    isCreating,
  } = useCalloutCreation();

  // TODO pass with props
  const { hubId } = useHub();

  const [fetchTemplates, { data: templatesData }] = useCalloutFormTemplatesFromHubLazyQuery();
  const getTemplates = () => fetchTemplates({ variables: { hubId: hubId } });

  const postTemplates = templatesData?.hub.templates?.postTemplates ?? [];
  const whiteboardTemplates = templatesData?.hub.templates?.whiteboardTemplates ?? [];
  const templates = { postTemplates, whiteboardTemplates };

  const handleCreate = () => {
    getTemplates();
    handleCreateCalloutOpened();
  };

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
      />
      {canCreateCallout && <AddContentButton onClick={handleCreate} />}
      <CalloutCreationDialog
        open={isCalloutCreationDialogOpen}
        onClose={handleCreateCalloutClosed}
        onSaveAsDraft={handleCalloutDrafted}
        isCreating={isCreating}
        calloutNames={calloutNames}
        templates={templates}
      />
    </>
  );
};

export default CalloutsGroupView;

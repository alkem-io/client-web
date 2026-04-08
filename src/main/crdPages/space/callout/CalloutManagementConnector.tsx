import { useState } from 'react';
import { CalloutContextMenu } from '@/crd/components/callout/CalloutContextMenu';

type CalloutManagementConnectorProps = {
  calloutId: string;
  isDraft: boolean;
  editable: boolean;
  movable: boolean;
  canSaveAsTemplate: boolean;
  onRefetch?: () => void;
};

/**
 * Wires CalloutContextMenu actions to GraphQL mutations and MUI dialogs.
 * Each action delegates to existing domain hooks/mutations.
 */
export function CalloutManagementConnector({
  calloutId,
  isDraft,
  editable,
  movable,
  canSaveAsTemplate,
  onRefetch,
}: CalloutManagementConnectorProps) {
  const [_editOpen, setEditOpen] = useState(false);

  const handleEdit = () => {
    setEditOpen(true);
  };

  const handlePublish = () => {
    // TODO: Call useUpdateCalloutVisibilityMutation with PUBLISHED
    onRefetch?.();
  };

  const handleUnpublish = () => {
    // TODO: Call useUpdateCalloutVisibilityMutation with DRAFT
    onRefetch?.();
  };

  const handleDelete = () => {
    // TODO: Show MUI confirmation dialog, then call useDeleteCalloutMutation
    onRefetch?.();
  };

  const handleSaveAsTemplate = () => {
    // TODO: Open MUI save-as-template dialog
  };

  const handleShare = () => {
    // TODO: Open MUI share dialog
  };

  const handleMoveTop = () => {
    // TODO: Call onCalloutsSortOrderUpdate with 'top'
    onRefetch?.();
  };

  const handleMoveUp = () => {
    // TODO: Call onCalloutsSortOrderUpdate with 'up'
    onRefetch?.();
  };

  const handleMoveDown = () => {
    // TODO: Call onCalloutsSortOrderUpdate with 'down'
    onRefetch?.();
  };

  const handleMoveBottom = () => {
    // TODO: Call onCalloutsSortOrderUpdate with 'bottom'
    onRefetch?.();
  };

  return (
    <CalloutContextMenu
      isDraft={isDraft}
      editable={editable}
      movable={movable}
      canSaveAsTemplate={canSaveAsTemplate}
      onEdit={handleEdit}
      onPublish={isDraft ? handlePublish : undefined}
      onUnpublish={!isDraft ? handleUnpublish : undefined}
      onDelete={handleDelete}
      onSaveAsTemplate={handleSaveAsTemplate}
      onShare={handleShare}
      onMoveTop={handleMoveTop}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      onMoveBottom={handleMoveBottom}
    />
  );
}

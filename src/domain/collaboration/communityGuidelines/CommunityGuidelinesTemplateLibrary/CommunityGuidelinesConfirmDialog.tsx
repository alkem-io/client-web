import { FC } from 'react';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';

interface CommunityGuidelinesConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  handleSelectTemplate: () => void;
}

const CommunityGuidelinesConfirmDialog: FC<CommunityGuidelinesConfirmDialogProps> = ({
  open,
  onClose,
  handleSelectTemplate,
}) => {
  return (
    <ConfirmationDialog
      actions={{
        onConfirm: handleSelectTemplate,
        onCancel: onClose,
      }}
      options={{
        show: open,
      }}
      entities={{
        titleId: 'community.communityGuidelines.confirmDialog.title',
        contentId: 'community.communityGuidelines.confirmDialog.description',
        confirmButtonTextId: 'buttons.yesReplace',
      }}
    />
  );
};

export default CommunityGuidelinesConfirmDialog;

import { FC } from 'react';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';

interface CommunityGuidelinesConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CommunityGuidelinesConfirmationDialog: FC<CommunityGuidelinesConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <ConfirmationDialog
      actions={{
        onConfirm,
        onCancel: onClose,
      }}
      options={{
        show: open,
      }}
      entities={{
        titleId: 'community.communityGuidelines.confirmationDialog.title',
        contentId: 'community.communityGuidelines.confirmationDialog.description',
        confirmButtonTextId: 'buttons.yesReplace',
      }}
    />
  );
};

export default CommunityGuidelinesConfirmationDialog;

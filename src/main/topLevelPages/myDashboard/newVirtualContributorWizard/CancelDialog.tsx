import { FC } from 'react';
import ConfirmationDialog from '@core/ui/dialogs/ConfirmationDialog';

interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelDialog: FC<CancelDialogProps> = ({ open, onClose, onConfirm }) => {
  return (
    <ConfirmationDialog
      actions={{
        onConfirm: onConfirm,
        onCancel: onClose,
      }}
      options={{
        show: open,
      }}
      entities={{
        titleId: 'createVirtualContributorWizard.cancel.title',
        contentId: 'createVirtualContributorWizard.cancel.description',
        confirmButtonTextId: 'buttons.yesStop',
      }}
    />
  );
};

export default CancelDialog;

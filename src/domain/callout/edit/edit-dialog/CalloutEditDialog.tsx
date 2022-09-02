import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { LoadingButton } from '@mui/lab';
import { CampaignOutlined } from '@mui/icons-material';
import { DialogActions, DialogContent, DialogTitle } from '../../../../common/components/core/dialog';
import CalloutForm, {
  CalloutFormOutput,
} from '../../../../common/components/composite/aspect/AspectCreationDialog/form/CalloutForm';
import ConfirmationDialog, {
  ConfirmationDialogProps,
} from '../../../../common/components/composite/dialogs/ConfirmationDialog';
import { CalloutEditType } from '../CalloutEditType';

export interface CalloutEditDialogProps {
  open: boolean;
  title: string;
  callout: CalloutEditType;
  onClose: () => void;
  onDelete: (callout: CalloutEditType) => Promise<void>;
  onCalloutEdit: (callout: CalloutEditType) => Promise<void>;
}

const CalloutEditDialog: FC<CalloutEditDialogProps> = ({ open, title, callout, onClose, onDelete, onCalloutEdit }) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(true);
  const [newCallout, setNewCallout] = useState<CalloutFormOutput>(callout);
  const handleStatusChanged = (valid: boolean) => setValid(valid);
  const handleChange = (newCallout: CalloutFormOutput) => setNewCallout(newCallout);
  const handleSave = async () => {
    setLoading(true);
    await onCalloutEdit({ ...callout, ...newCallout });
    setLoading(false);
  };
  const handleDelete = async () => {
    setLoading(true);
    await onDelete(callout);
    setLoading(false);
  };
  const handleDialogDelete = () => setConfirmDialogOpened(true);

  const [confirmDialogOpened, setConfirmDialogOpened] = useState(false);

  const confirmationDialogProps = useMemo<ConfirmationDialogProps>(
    () => ({
      entities: {
        titleId: 'callout.delete-confirm-title',
        contentId: 'callout.delete-confirm-text',
        confirmButtonTextId: 'buttons.delete',
      },
      options: {
        show: confirmDialogOpened,
      },
      actions: {
        onConfirm: handleDelete,
        onCancel: () => setConfirmDialogOpened(false),
      },
    }),
    [confirmDialogOpened, handleDelete, setConfirmDialogOpened]
  );

  return (
    <>
      <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="callout-visibility-dialog-title" onClose={onClose}>
        <DialogTitle onClose={onClose}>
          <Box display="flex" alignItems="center">
            <CampaignOutlined sx={{ mr: theme => theme.spacing(1) }} />
            {title}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <CalloutForm callout={callout} edit onStatusChanged={handleStatusChanged} onChange={handleChange} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <LoadingButton
            loading={loading}
            disabled={loading}
            variant="outlined"
            color="negative"
            onClick={handleDialogDelete}
          >
            {t('buttons.delete')}
          </LoadingButton>
          <LoadingButton loading={loading} disabled={!valid || loading} variant="contained" onClick={handleSave}>
            {t('buttons.save')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <ConfirmationDialog {...confirmationDialogProps} />
    </>
  );
};
export default CalloutEditDialog;

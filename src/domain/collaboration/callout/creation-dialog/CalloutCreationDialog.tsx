import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog/Dialog';
import { CalloutType } from '../../../../models/graphql-schema';
import { CalloutCreationType } from './useCalloutCreation/useCalloutCreation';
import { Box, Button } from '@mui/material';
import { DialogActions, DialogContent, DialogTitle } from '../../../../common/components/core/dialog';
import { LoadingButton } from '@mui/lab';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CalloutForm from '../CalloutForm';

export type CalloutCreationDialogFields = {
  description?: string;
  displayName?: string;
  templateId?: string;
  type?: CalloutType;
};

export interface CalloutCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onSaveAsDraft: (callout: CalloutCreationType) => Promise<void>;
  isCreating: boolean;
}

const CalloutCreationDialog: FC<CalloutCreationDialogProps> = ({ open, onClose, onSaveAsDraft, isCreating }) => {
  const { t } = useTranslation();

  const [callout, setCallout] = useState<CalloutCreationDialogFields>({});
  const [isValid, setIsValid] = useState(false);

  const handleValueChange = useCallback(
    calloutValues => {
      setCallout({ ...callout, ...calloutValues });
    },
    [callout]
  );
  const handleStatusChange = useCallback((isValid: boolean) => setIsValid(isValid), []);

  const handleSaveAsDraft = useCallback(async () => {
    const newCallout = {
      displayName: callout.displayName!,
      description: callout.description!,
      templateId: callout.templateId!,
      type: callout.type!,
    };

    const result = await onSaveAsDraft(newCallout);

    setCallout({});

    return result;
  }, [callout, onSaveAsDraft]);

  const handleClose = useCallback(() => {
    onClose?.();
    setCallout({});
  }, [onClose]);

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="callout-creation-title">
      <DialogTitle id="callout-creation-title" onClose={handleClose}>
        <Box display="flex">
          <CampaignOutlinedIcon sx={{ marginRight: 1 }} />
          {t('components.callout-creation.title')}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box paddingY={theme => theme.spacing(2)}>
          <CalloutForm callout={callout} onChange={handleValueChange} onStatusChanged={handleStatusChange} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'end' }}>
        {onClose && (
          <Button onClick={onClose} variant="outlined">
            {t('buttons.cancel')}
          </Button>
        )}

        <LoadingButton
          loading={isCreating}
          loadingIndicator={`${t('buttons.save-draft')}...`}
          onClick={handleSaveAsDraft}
          variant="contained"
          disabled={!isValid}
        >
          {t('buttons.save-draft')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default CalloutCreationDialog;

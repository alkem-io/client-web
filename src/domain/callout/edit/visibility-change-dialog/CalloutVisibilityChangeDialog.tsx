import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { LoadingButton } from '@mui/lab';
import { CampaignOutlined } from '@mui/icons-material';
import { DialogActions, DialogContent, DialogTitle } from '../../../../common/components/core/dialog';
import { CalloutVisibility } from '../../../../models/graphql-schema';

export interface CalloutVisibilityChangeDialogProps {
  open: boolean;
  title: string;
  draft: boolean;
  onClose: () => void;
  onVisibilityChanged: (visibility: CalloutVisibility) => Promise<void>;
}

const CalloutVisibilityChangeDialog: FC<CalloutVisibilityChangeDialogProps> = ({
  open,
  title,
  draft,
  children,
  onClose,
  onVisibilityChanged,
}) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const handleVisibilityChanged = async () => {
    setLoading(true);
    await onVisibilityChanged(draft ? CalloutVisibility.Published : CalloutVisibility.Draft);
    setLoading(false);
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="callout-visibility-dialog-title" onClose={onClose}>
      <DialogTitle onClose={onClose}>
        <Box display="flex" alignItems="center">
          <CampaignOutlined sx={{ mr: theme => theme.spacing(1) }} />
          {title}
        </Box>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions sx={{ justifyContent: 'end' }}>
        <Button onClick={onClose} disabled={loading} variant="text">
          {t('buttons.cancel')}
        </Button>
        <LoadingButton loading={loading} variant="contained" onClick={handleVisibilityChanged}>
          {t(`buttons.${draft ? '' : 'un'}publish` as const)}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
export default CalloutVisibilityChangeDialog;

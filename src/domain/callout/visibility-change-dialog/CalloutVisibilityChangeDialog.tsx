import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { CampaignOutlined } from '@mui/icons-material';
import { DialogActions, DialogContent, DialogTitle } from '../../../components/core/dialog';
import { CalloutVisibility } from '../../../models/graphql-schema';

export interface CalloutVisibilityChangeDialogProps {
  open: boolean;
  title: string;
  draft: boolean;
  onClose: () => void;
  onVisibilityChanged: (visibility: CalloutVisibility) => void;
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
        <Button onClick={onClose} variant="text">
          {t('buttons.cancel')}
        </Button>
        <Button
          onClick={() => onVisibilityChanged(draft ? CalloutVisibility.Published : CalloutVisibility.Draft)}
          variant="contained"
        >
          {t(`buttons.${draft ? '' : 'un'}publish` as const)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default CalloutVisibilityChangeDialog;

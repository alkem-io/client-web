import { Button, Dialog, DialogContent } from '@mui/material';
import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { DialogActions, DialogTitle } from '../../../core/dialog';
import isApplicationPending from './is-application-pending';

export interface PreApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  dialogVariant: 'dialog-parent-app-pending' | 'dialog-apply-parent';
  hubName?: string;
  challengeName?: string;
  parentApplicationState?: string;
  applyUrl?: string;
  parentApplyUrl?: string;
}

const PreApplicationDialog: FC<PreApplicationDialogProps> = ({
  open,
  onClose,
  dialogVariant,
  hubName,
  challengeName,
  parentApplicationState,
  applyUrl,
  parentApplyUrl,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open}>
      <DialogTitle onClose={onClose}>{t(`components.application-button.${dialogVariant}.title` as const)}</DialogTitle>
      <DialogContent dividers>
        <Trans
          i18nKey={`components.application-button.${dialogVariant}.body` as const}
          values={{ hubName, challengeName }}
          components={{
            strong: <strong />,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          component={RouterLink}
          to={(isApplicationPending(parentApplicationState) ? applyUrl : parentApplyUrl) || ''}
          variant="contained"
          aria-label="dialog-apply"
        >
          {t('buttons.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default PreApplicationDialog;

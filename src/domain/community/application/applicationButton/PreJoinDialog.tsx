import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Dialog, DialogContent } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { BlockTitle } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import { Actions } from '../../../../core/ui/actions/Actions';

export interface PreApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  onJoin: () => void;
}

const PreJoinDialog: FC<PreApplicationDialogProps> = ({ open, onClose, onJoin }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{t('components.application-button.dialog-join.title')}</BlockTitle>
      </DialogHeader>
      <DialogContent>
        <Trans i18nKey="components.application-button.dialog-join.body" />
      </DialogContent>
      <Actions padding={gutters()} sx={{ justifyContent: 'end' }}>
        <Button onClick={onJoin} variant="contained" aria-label="dialog-join">
          {t('components.application-button.join')}
        </Button>
      </Actions>
    </Dialog>
  );
};

export default PreJoinDialog;

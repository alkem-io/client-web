import { Button, Dialog, DialogContent, Skeleton } from '@mui/material';
import React, { PropsWithChildren, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Loading } from '../../../../common/components/core';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { BlockTitle } from '../../../../core/ui/typography';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';

interface ConfirmationDialogProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  confirmButton: ReactNode;
  loading?: boolean;
}

const ConfirmationDialog = ({
  open,
  title,
  loading = false,
  onClose,
  confirmButton,
  children,
}: PropsWithChildren<ConfirmationDialogProps>) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{title}</BlockTitle>
      </DialogHeader>
      <DialogContent>{loading ? <Loading /> : children}</DialogContent>
      <Actions padding={gutters()} justifyContent="end">
        <Button variant="contained" onClick={onClose}>
          {t('buttons.cancel')}
        </Button>
        {loading ? <Skeleton sx={{ width: gutters(4), height: gutters(2) }} /> : confirmButton}
      </Actions>
    </Dialog>
  );
};

export default ConfirmationDialog;

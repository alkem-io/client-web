import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { LoadingButton } from '@mui/lab';
import { DialogContent } from '../dialog/deprecated';
import DialogHeader from '../dialog/DialogHeader';
import { BlockTitle } from '../typography';
import { Actions } from '../actions/Actions';
import { gutters } from '../grid/utils';
import useLoadingState from '../../../domain/shared/utils/useLoadingState';

export interface YesNoCancelDialogProps {
  open?: boolean;
  dialogTitle: string;
  dialogContent: ReactNode;
  buttonTexts?: {
    yes?: string;
    no?: string;
    cancel?: string;
  };
  onYes?: () => Promise<unknown> | void;
  onNo?: () => Promise<unknown> | void;
  onCancel?: () => Promise<unknown> | void;
  onClose: () => void;
}

const YesNoCancelDialog: FC<YesNoCancelDialogProps> = ({
  open = false,
  dialogTitle,
  dialogContent,
  buttonTexts,
  onYes,
  onNo,
  onCancel,
  onClose,
}) => {
  const { t } = useTranslation();
  const [handleCancel, loadingCancel] = useLoadingState(async () => {
    await onCancel?.();
  });
  const [handleNo, loadingNo] = useLoadingState(async () => {
    await onNo?.();
  });
  const [handleYes, loadingYes] = useLoadingState(async () => {
    await onYes?.();
  });

  const loading = loadingCancel || loadingYes || loadingNo;

  return (
    <Dialog open={open} aria-labelledby="YesNoCancel-dialog" onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{dialogTitle}</BlockTitle>
      </DialogHeader>
      <DialogContent>{dialogContent}</DialogContent>
      <Actions padding={gutters()} sx={{ justifyContent: 'end' }}>
        {onCancel ? (
          <LoadingButton variant="contained" loading={loadingCancel} disabled={loading} onClick={handleCancel}>
            {buttonTexts?.cancel ?? t('buttons.cancel')}
          </LoadingButton>
        ) : undefined}
        {onNo ? (
          <LoadingButton variant="outlined" loading={loadingNo} disabled={loading} onClick={handleNo}>
            {buttonTexts?.no ?? t('buttons.no')}
          </LoadingButton>
        ) : undefined}
        {onYes ? (
          <LoadingButton variant="outlined" loading={loadingYes} disabled={loading} onClick={handleYes}>
            {buttonTexts?.yes ?? t('buttons.yes')}
          </LoadingButton>
        ) : undefined}
      </Actions>
    </Dialog>
  );
};

export default YesNoCancelDialog;

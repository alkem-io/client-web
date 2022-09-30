import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import { DialogActions, DialogContent, DialogTitle } from '../../../../../common/components/core/dialog';
import createLayoutHolder from '../../../../shared/layout/LayoutHolder';
import { LoadingButton } from '@mui/lab';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';

interface OneStepCreationLayoutProps {
  dialogTitle: string;
  isValid?: boolean;
  onClose?: () => void;
  isCreating: boolean;
  onSaveAsDraft?: () => Promise<void>;
}

const OneStepCreationLayoutImpl: FC<OneStepCreationLayoutProps> = ({
  children,
  dialogTitle,
  onClose,
  isValid = true,
  onSaveAsDraft,
  isCreating,
}) => {
  const { t } = useTranslation();

  return (
    <Box>
      <DialogTitle id="callout-creation-title" onClose={onClose}>
        <Box display="flex">
          <CampaignOutlinedIcon />
          {dialogTitle}
        </Box>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions sx={{ justifyContent: 'end' }}>
        {onClose && (
          <Button onClick={onClose} variant="outlined">
            {t('buttons.cancel')}
          </Button>
        )}
        {onSaveAsDraft && (
          <LoadingButton
            loading={isCreating}
            loadingIndicator={`${t('buttons.save-draft')}...`}
            onClick={onSaveAsDraft}
            variant="contained"
            disabled={!isValid}
          >
            {t('buttons.save-draft')}
          </LoadingButton>
        )}
      </DialogActions>
    </Box>
  );
};

export const { LayoutHolder: StepLayoutHolder, createLayout } = createLayoutHolder();

export const OneStepCreationLayout = createLayout(OneStepCreationLayoutImpl);

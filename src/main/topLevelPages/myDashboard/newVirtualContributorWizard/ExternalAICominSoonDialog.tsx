import React from 'react';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import { Box, Button, DialogContent } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import { Actions } from '../../../../core/ui/actions/Actions';

interface ExternalAIComingSoonDialogProps {
  open: boolean;
  onClose: () => void;
}

const ExternalAIComingSoonDialog: React.FC<ExternalAIComingSoonDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();

  const sendNotification = () => {};

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={8}>
      <DialogHeader title={'🚀 Coming soon!'} onClose={onClose} />
      <DialogContent>
        <Gutters disablePadding>
          <Box display="flex" gap={gutters(0.5)}>
            <Caption alignSelf="center">todo</Caption>
          </Box>
          <Actions justifyContent="end">
            <Button variant="text" onClick={onClose}>
              {t('buttons.back')}
            </Button>
            <Button variant="contained" onClick={sendNotification}>
              send
            </Button>
          </Actions>
        </Gutters>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default ExternalAIComingSoonDialog;

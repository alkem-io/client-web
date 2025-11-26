import { useState } from 'react';
import HelpIcon from '@mui/icons-material/Help';
import HelpDialog from '@/core/help/dialog/HelpDialog';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PlatformHelpButton = () => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const openHelpDialog = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <IconButton onClick={openHelpDialog} aria-label={t('common.help')}>
        <HelpIcon color="primary" fontSize="large" sx={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));' }} />
      </IconButton>
      <HelpDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export default PlatformHelpButton;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonProps } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const SendButton = ({ children, ...props }: ButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button startIcon={<SendIcon />} variant="contained" {...props}>
      {children ?? t('buttons.send')}
    </Button>
  );
};

export default SendButton;

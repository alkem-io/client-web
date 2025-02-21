import React from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import SendIcon from '@mui/icons-material/Send';

const SendButton = ({ children, ...props }: LoadingButtonProps) => {
  const { t } = useTranslation();

  return (
    <LoadingButton startIcon={<SendIcon />} variant="contained" {...props}>
      {children ?? t('buttons.send')}
    </LoadingButton>
  );
};

export default SendButton;

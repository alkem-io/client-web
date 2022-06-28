import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonProps } from '@mui/material';

const DeleteButton = ({ children, ...props }: ButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button color="error" {...props} sx={{ fontWeight: 'bold' }}>
      {children ?? t('buttons.delete')}
    </Button>
  );
};

export default DeleteButton;

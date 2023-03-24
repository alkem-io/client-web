import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';

const BackButton = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  ...props
}: ButtonProps<D, P>) => {
  const { t } = useTranslation();
  return (
    <Button startIcon={<ArrowBackIcon />} {...props}>
      {props.children ? props.children : t('buttons.back')}
    </Button>
  );
};

export default BackButton;

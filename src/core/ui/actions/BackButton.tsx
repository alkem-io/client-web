import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, type ButtonProps } from '@mui/material';
import type { ButtonTypeMap } from '@mui/material/Button/Button';
import type React from 'react';
import { useTranslation } from 'react-i18next';

const BackButton = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  ...props
}: ButtonProps<D, P>) => {
  const { t } = useTranslation();
  return (
    <Button startIcon={<ArrowBackIcon />} {...props}>
      {props.children ?? t('buttons.back')}
    </Button>
  );
};

export default BackButton;

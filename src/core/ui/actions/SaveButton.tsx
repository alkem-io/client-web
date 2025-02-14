import React from 'react';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import { useTranslation } from 'react-i18next';
import SaveIcon from '@mui/icons-material/Save';

const SaveButton = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  loading,
  children,
  ...props
}: LoadingButtonProps<D, P>) => {
  const { t } = useTranslation();
  return (
    <LoadingButton variant="contained" loading={loading} startIcon={<SaveIcon />} {...props}>
      {children ? children : t(`buttons.${loading ? 'processing' : 'save'}` as const)}
    </LoadingButton>
  );
};

export default SaveButton;

import React from 'react';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import { useTranslation } from 'react-i18next';
import DeleteOutlinedIcon from '@mui/icons-material/Delete';

const DeleteButton = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  loading,
  children,
  ...props
}: LoadingButtonProps<D, P>) => {
  const { t } = useTranslation();

  return (
    <LoadingButton variant="outlined" loading={loading} color="error" startIcon={<DeleteOutlinedIcon />} {...props}>
      {children ? children : t(`buttons.${loading ? 'processing' : 'delete'}` as const)}
    </LoadingButton>
  );
};

export default DeleteButton;

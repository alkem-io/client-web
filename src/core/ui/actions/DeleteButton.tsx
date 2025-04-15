import React from 'react';
import { Button, ButtonProps, ButtonTypeMap } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

const DeleteButton = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  loading,
  children,
  ...props
}: ButtonProps<D, P>) => {
  const { t } = useTranslation();

  return (
    <Button variant="outlined" loading={loading} color="error" startIcon={<DeleteOutlinedIcon />} {...props}>
      {children ? children : t(`buttons.${loading ? 'processing' : 'delete'}` as const)}
    </Button>
  );
};

export default DeleteButton;

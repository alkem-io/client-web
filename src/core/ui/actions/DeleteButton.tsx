import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { Button, type ButtonProps, type ButtonTypeMap } from '@mui/material';
import type React from 'react';
import { useTranslation } from 'react-i18next';

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

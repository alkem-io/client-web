import SaveIcon from '@mui/icons-material/Save';
import { Button, type ButtonProps, type ButtonTypeMap } from '@mui/material';
import type React from 'react';
import { useTranslation } from 'react-i18next';

const SaveButton = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  loading,
  children,
  ...props
}: ButtonProps<D, P>) => {
  const { t } = useTranslation();
  return (
    <Button variant="contained" loading={loading} startIcon={<SaveIcon />} {...props}>
      {children ? children : t(`buttons.${loading ? 'processing' : 'save'}` as const)}
    </Button>
  );
};

export default SaveButton;

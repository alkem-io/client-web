import React from 'react';
import { Button, ButtonProps, ButtonTypeMap } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SaveIcon from '@mui/icons-material/Save';

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

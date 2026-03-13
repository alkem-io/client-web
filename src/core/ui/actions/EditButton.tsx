import EditIcon from '@mui/icons-material/Edit';
import { Button, type ButtonProps } from '@mui/material';
import type { ButtonTypeMap } from '@mui/material/Button/Button';
import type React from 'react';
import { useTranslation } from 'react-i18next';

const EditButton = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  ...props
}: ButtonProps<D, P>) => {
  const { t } = useTranslation();
  return (
    <Button startIcon={<EditIcon />} {...props}>
      {props.children ?? t('buttons.edit')}
    </Button>
  );
};

export default EditButton;

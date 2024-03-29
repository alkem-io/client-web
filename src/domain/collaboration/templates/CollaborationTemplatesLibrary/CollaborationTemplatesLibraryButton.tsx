import { Button, ButtonProps } from '@mui/material';
import React, { FC } from 'react';
import { LibraryIcon } from '../LibraryIcon';
import { useTranslation } from 'react-i18next';

export interface CollaborationTemplatesLibraryButtonProps extends ButtonProps {}

const CollaborationTemplatesLibraryButton: FC<CollaborationTemplatesLibraryButtonProps> = buttonProps => {
  const { t } = useTranslation();
  const defaults = {
    children: <>{t('buttons.find-template')}</>,
    startIcon: <LibraryIcon />,
  };
  return <Button variant="outlined" {...defaults} {...buttonProps} />;
};

export default CollaborationTemplatesLibraryButton;

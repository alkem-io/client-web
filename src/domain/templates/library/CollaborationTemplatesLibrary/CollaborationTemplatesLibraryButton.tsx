import { Button, ButtonProps } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { LibraryIcon } from '../../LibraryIcon';
import { CARLOS_BORDER_RED } from '../../_new/borders';

export interface CollaborationTemplatesLibraryButtonProps extends ButtonProps {}
/**
 * @deprecated
 */
const CollaborationTemplatesLibraryButton: FC<CollaborationTemplatesLibraryButtonProps> = buttonProps => {
  const { t } = useTranslation();
  const defaults = {
    children: <>{t('buttons.find-template')}</>,
    startIcon: <LibraryIcon />,
  };
  return <Button variant="outlined" {...defaults} {...buttonProps} sx={{ border: CARLOS_BORDER_RED }} />;
};

export default CollaborationTemplatesLibraryButton;

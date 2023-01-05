import React, { FC } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LanguageLabels, supportedLngs } from '../../../../../core/i18n/config';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';

const LanguageSelect: FC = () => {
  const { i18n, t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelection = (value: string) => {
    i18n.changeLanguage(value);
    setAnchorEl(null);
  };

  const openLanguageSelection = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Button startIcon={<LanguageOutlinedIcon />} onClick={openLanguageSelection} size="small">
        {t('common.language')}
      </Button>
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {supportedLngs.map(lng => (
          <MenuItem key={lng} onClick={() => handleLanguageSelection(lng)}>
            {LanguageLabels[lng]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelect;

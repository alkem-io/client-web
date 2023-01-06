import React, { FC } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { supportedLngs } from '../../../../../core/i18n/config';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { Caption } from '../../../../../core/ui/typography';

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
      <Caption
        component={Button}
        startIcon={<LanguageOutlinedIcon />}
        onClick={openLanguageSelection}
        size="small"
        color="inherit"
        sx={{ textTransform: 'none', display: 'flex' }}
      >
        {t('common.language')}
      </Caption>
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
        sx={{ '.MuiMenu-list': { padding: 0 } }}
      >
        {supportedLngs.map(lng => (
          <MenuItem key={lng} selected={lng === i18n.language} onClick={() => handleLanguageSelection(lng)}>
            <Caption>{t(`languages.${lng}` as const)}</Caption>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelect;

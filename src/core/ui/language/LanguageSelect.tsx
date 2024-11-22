import { ReactNode, useState } from 'react';
import { Menu, MenuItem, MenuProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { supportedLngs } from '@/core/i18n/config';
import { Caption } from '../typography';

interface ChildProps {
  openSelect: (anchorEl: HTMLElement) => void;
  closeSelect: () => void;
}

interface LanguageSelectProps extends Pick<MenuProps, 'anchorOrigin' | 'transformOrigin'> {
  children: ({ openSelect, closeSelect }: ChildProps) => ReactNode;
  zIndex?: number;
}

const LanguageSelect = ({ zIndex, children }: LanguageSelectProps) => {
  const { i18n, t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelection = (value: string) => {
    i18n.changeLanguage(value);
    setAnchorEl(null);
  };

  return (
    <>
      {children({
        openSelect: setAnchorEl,
        closeSelect: handleClose,
      })}
      <Menu open={open} anchorEl={anchorEl} onClose={handleClose} sx={{ '.MuiMenu-list': { padding: 0 }, zIndex }}>
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

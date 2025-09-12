import { ReactNode, useState } from 'react';
import { Menu, MenuItem, MenuProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { supportedLngs } from '@/core/i18n/config';
import { Caption } from '../typography';

interface ChildProps {
  openSelect: (anchorEl: HTMLElement) => void;
  closeSelect: () => void;
  isOpen: boolean;
}

interface LanguageSelectProps extends Pick<MenuProps, 'anchorOrigin' | 'transformOrigin'> {
  children: ({ openSelect, closeSelect, isOpen }: ChildProps) => ReactNode;
  zIndex?: number;
}

const LanguageSelect = ({ zIndex, children, anchorOrigin, transformOrigin }: LanguageSelectProps) => {
  const { i18n, t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

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
        isOpen,
        openSelect: setAnchorEl,
        closeSelect: handleClose,
      })}
      <Menu
        id="language-menu"
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        sx={{ '.MuiMenu-list': { padding: 0 }, zIndex }}
        slotProps={{
          list: {
            'aria-labelledby': 'language-button',
          },
        }}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
      >
        {supportedLngs.map(lng => (
          <MenuItem key={lng} selected={lng === i18n.language} onClick={() => handleLanguageSelection(lng)}>
            <Caption lang={lng}>{t(`languages.${lng}` as const)}</Caption>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelect;

import type { MenuProps } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLngs } from '@/core/i18n/config';

interface LanguageSelectOptions extends Pick<MenuProps, 'anchorOrigin' | 'transformOrigin'> {
  zIndex?: number;
}

const useLanguageSelect = (options: LanguageSelectOptions = {}) => {
  const { i18n, t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  const closeSelect = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelection = (value: string) => {
    i18n.changeLanguage(value);
    setAnchorEl(null);
  };

  const menuProps = {
    id: 'language-menu' as const,
    open: isOpen,
    anchorEl,
    onClose: closeSelect,
    sx: { '.MuiMenu-list': { padding: 0 }, zIndex: options.zIndex },
    slotProps: {
      list: {
        'aria-labelledby': 'language-button',
      },
    },
    anchorOrigin: options.anchorOrigin,
    transformOrigin: options.transformOrigin,
  };

  const languages = supportedLngs.map(lng => ({
    key: lng,
    label: t(`languages.${lng}` as const),
    selected: lng === i18n.language,
    onClick: () => handleLanguageSelection(lng),
    lang: lng,
  }));

  return {
    openSelect: setAnchorEl,
    closeSelect,
    isOpen,
    menuProps,
    languages,
  };
};

export default useLanguageSelect;

import React, { FC, useCallback } from 'react';
import LanguageIcon from '@mui/icons-material/Language';
import { MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { supportedLngs } from '../../i18n/config';

const LanguageSelect: FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageSelection = useCallback(({ target: { value } }: { target: { value: string } }) => {
    i18n.changeLanguage(value);
  }, []);

  return (
    <TextField select size="small" value={i18n.language} label={<LanguageIcon />} onChange={handleLanguageSelection}>
      {supportedLngs.map(lng => (
        <MenuItem value={lng}>{lng}</MenuItem>
      ))}
    </TextField>
  );
};

export default LanguageSelect;

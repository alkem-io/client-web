import React, { FC, useCallback } from 'react';
import LanguageIcon from '@mui/icons-material/Language';
import { MenuItem, TextField, TextFieldProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { supportedLngs } from '../../i18n/config';

interface LanguageSelectProps {
  sx?: TextFieldProps['sx'];
}

const LanguageSelect: FC<LanguageSelectProps> = ({ sx }) => {
  const { i18n } = useTranslation();

  const handleLanguageSelection = useCallback(({ target: { value } }: { target: { value: string } }) => {
    i18n.changeLanguage(value);
  }, []);

  return (
    <TextField
      select
      size="small"
      value={i18n.language}
      label={<LanguageIcon />}
      onChange={handleLanguageSelection}
      sx={sx}
    >
      {supportedLngs.map(lng => (
        <MenuItem key={lng} value={lng}>
          {lng}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default LanguageSelect;

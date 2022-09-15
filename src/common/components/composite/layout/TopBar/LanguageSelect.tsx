import React, { FC, useCallback } from 'react';
import { Box, MenuItem, TextField, TextFieldProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { supportedLngs } from '../../../../../core/i18n/config';

interface LanguageSelectProps {
  sx?: TextFieldProps['sx'];
}

const LanguageSelect: FC<LanguageSelectProps> = ({ sx }) => {
  const { i18n } = useTranslation();

  const handleLanguageSelection = useCallback(({ target: { value } }: { target: { value: string } }) => {
    i18n.changeLanguage(value);
  }, []);

  return (
    <Box sx={{ alignItems: 'center' }}>
      <TextField select size="small" value={i18n.language} onChange={handleLanguageSelection} sx={sx}>
        {supportedLngs.map(lng => (
          <MenuItem key={lng} value={lng}>
            {lng}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default LanguageSelect;

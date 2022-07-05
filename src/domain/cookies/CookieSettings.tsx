import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';
import { FormControl, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import Button from './components/Button';
import { useAlkemioCookies } from './useAlkemioCookies';
import TextContainer from './components/TextContainer';

const CookieSettings: FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { acceptOnlySelected } = useAlkemioCookies();

  const [cookiesState, setCookiesState] = useState({
    technical: true,
    analysis: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCookiesState({
      ...cookiesState,
      [event.target.name]: event.target.checked,
    });
  };

  const { analysis } = cookiesState;

  const CookieLabels = {
    technical: t('cookie.technical'),
    analysis: t('cookie.analysis'),
  };

  const handleConfirmChoice = () => {
    const selectedCookies = Object.entries(cookiesState);
    const selectedCookiesNamesList = selectedCookies.filter(value => value[1]).map(value => value[0]);
    acceptOnlySelected(selectedCookiesNamesList);
  };

  return (
    <>
      <TextContainer>
        {t('cookie.settings')}
        <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
          <FormGroup>
            <FormControlLabel
              control={<Checkbox style={{ color: '#FFFFFF' }} checked={true} name="technical" />}
              label={CookieLabels.technical}
            />
            <FormControlLabel
              control={
                <Checkbox style={{ color: '#FFFFFF' }} checked={analysis} onChange={handleChange} name="analysis" />
              }
              label={CookieLabels.analysis}
            />
          </FormGroup>
        </FormControl>
      </TextContainer>
      <Button
        sx={{
          alignSelf: 'flex-end',
          width: '250px',
          color: theme.palette.background.default,
          background: theme.palette.primary.dark,
          ':hover': {
            color: theme.palette.background.default,
            background: theme.palette.primary.dark,
          },
        }}
        onClick={handleConfirmChoice}
      >
        {t('buttons.confirm-choice')}
      </Button>
    </>
  );
};

export default CookieSettings;

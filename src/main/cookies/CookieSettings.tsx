import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, FormGroup, FormControlLabel, Checkbox, Button } from '@mui/material';
import { useAlkemioCookies } from './useAlkemioCookies';
import TextContainer from './components/TextContainer';
import { Actions } from '@/core/ui/actions/Actions';
import { Caption } from '@/core/ui/typography';

const CookieSettings: FC = () => {
  const { t } = useTranslation();
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
              control={<Checkbox style={{ color: '#FFFFFF' }} checked name="technical" />}
              label={<Caption>{CookieLabels.technical}</Caption>}
            />
            <FormControlLabel
              control={
                <Checkbox style={{ color: '#FFFFFF' }} checked={analysis} onChange={handleChange} name="analysis" />
              }
              label={<Caption>{CookieLabels.analysis}</Caption>}
            />
          </FormGroup>
        </FormControl>
      </TextContainer>
      <Actions>
        <Button
          variant="contained"
          sx={{
            alignSelf: 'flex-end',
            width: '250px',
          }}
          onClick={handleConfirmChoice}
        >
          {t('buttons.confirm-choice')}
        </Button>
      </Actions>
    </>
  );
};

export default CookieSettings;

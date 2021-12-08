import { MailOutline } from '@mui/icons-material';
import { Grid, InputAdornment, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import FormikInputField from '../../composite/forms/FormikInputField';
import GitHub from '../../core/icons/GitHub';
import LinkedIn from '../../core/icons/LinkedIn';
import Twitter from '../../core/icons/Twitter';

export interface SocialSegmentProps {
  readOnly?: boolean;
  disabled?: boolean;
}

const SocialSegment: FC<SocialSegmentProps> = ({ disabled, readOnly }) => {
  const { t } = useTranslation();

  return (
    <Grid item container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h4">{t('common.social')}</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormikInputField
          name={'linkedin'}
          title={'Linkedin'}
          readOnly={readOnly}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LinkedIn />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormikInputField
          name={'twitter'}
          title={'Twitter'}
          readOnly={readOnly}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Twitter />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormikInputField
          name={'github'}
          title={'Github'}
          readOnly={readOnly}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GitHub />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormikInputField
          name={'email'}
          type={'email'}
          title={'Mail'}
          readOnly={readOnly}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MailOutline />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </Grid>
  );
};
export default SocialSegment;

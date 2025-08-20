import { MailOutline } from '@mui/icons-material';
import { GridLegacy, InputAdornment, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import GitHub from '@/domain/shared/components/SocialLinks/icons/GitHub';
import LinkedIn from '@/domain/shared/components/SocialLinks/icons/LinkedIn';
import BlueSky from '@/domain/shared/components/SocialLinks/icons/BlueSky';

export interface SocialSegmentProps {
  readOnly?: boolean;
  disabled?: boolean;
  isNew?: boolean;
  fieldNames?: {
    email?: string;
  };
}

const SocialSegment: FC<SocialSegmentProps> = ({ disabled, readOnly, isNew, fieldNames }) => {
  const { t } = useTranslation();

  return (
    <GridLegacy item container spacing={4}>
      <GridLegacy item xs={12}>
        <Typography variant="h4">{t('common.social')}</Typography>
      </GridLegacy>
      <GridLegacy item xs={12} md={6}>
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
      </GridLegacy>
      <GridLegacy item xs={12} md={6}>
        <FormikInputField
          name={'bsky'}
          title={'BlueSky'}
          readOnly={readOnly}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BlueSky />
              </InputAdornment>
            ),
          }}
        />
      </GridLegacy>
      <GridLegacy item xs={12} md={6}>
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
      </GridLegacy>
      <GridLegacy item xs={12} md={6}>
        <FormikInputField
          name={fieldNames?.email ?? 'email'}
          type={'email'}
          title={'Mail'}
          readOnly={readOnly || !isNew}
          disabled={disabled || !isNew}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MailOutline />
              </InputAdornment>
            ),
          }}
        />
      </GridLegacy>
    </GridLegacy>
  );
};

export default SocialSegment;

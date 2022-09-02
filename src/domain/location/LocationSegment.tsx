import { Grid, Typography } from '@mui/material';
import React, { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import CountrySelect from '../../common/components/composite/forms/CountrySelect';
import FormikInputField from '../../common/components/composite/forms/FormikInputField';
import FormRow from '../shared/layout/FormLayout';

interface LocationSegmentProps {
  cols?: number;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;

  cityFieldName?: string;
  countryFieldName?: string;
}

export const LocationSegment: FC<PropsWithChildren<LocationSegmentProps>> = props => {
  const { t } = useTranslation();
  const cols = !props?.cols || props?.cols <= 0 ? 1 : props!.cols,
    disabled = props.disabled || false,
    required = props.required || false,
    readonly = props.readonly || false,
    cityFieldName = props.cityFieldName || 'city',
    countryFieldName = props.countryFieldName || 'country';

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h4">{t('components.profileSegment.location.title')}</Typography>
      </Grid>
      <FormRow cols={cols}>
        <CountrySelect
          name={countryFieldName}
          title={t('components.profileSegment.location.country.name')}
          key="name"
          readOnly={readonly}
          disabled={disabled}
          required={required}
        />
      </FormRow>
      <FormRow cols={cols}>
        <FormikInputField
          name={cityFieldName}
          title={t('components.profileSegment.location.city.name')}
          placeholder={t('components.profileSegment.location.city.placeholder')}
          readOnly={readonly}
          disabled={disabled}
          required={required}
        />
        {props.children}
      </FormRow>
    </>
  );
};

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { LONG_TEXT_LENGTH, MID_TEXT_LENGTH } from '../../../models/constants/field-length.constants';
import FormikInputField from '../../composite/forms/FormikInputField';
import CountrySelect from '../../composite/forms/CountrySelect';
import FormRow from '../../../domain/shared/layout/FormLayout';

export const profileSegmentSchema = yup.object().shape({
  avatar: yup.string().max(MID_TEXT_LENGTH),
  description: yup.string().max(LONG_TEXT_LENGTH),
});

interface ProfileSegmentProps {
  disabled?: boolean;
  required?: boolean;
}

export const ProfileSegment: FC<ProfileSegmentProps> = ({ disabled = false, required = false }) => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow cols={1}>
        <FormikInputField
          name="description"
          title={t('components.profileSegment.description.name')}
          placeholder={t('components.profileSegment.description.placeholder')}
          disabled={disabled}
          required={required}
        />
      </FormRow>
      <FormRow cols={2}>
        <FormikInputField
          name="location.city"
          title={t('components.profileSegment.location.city.name')}
          placeholder={t('components.profileSegment.location.city.placeholder')}
          disabled={disabled}
        />
      </FormRow>
      <FormRow cols={2}>
        <CountrySelect
          name="location.country"
          title={t('components.profileSegment.location.country.name')}
          key="name"
          disabled={disabled}
        />
      </FormRow>
    </>
  );
};

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { LONG_TEXT_LENGTH, MID_TEXT_LENGTH } from '../../../../models/constants/field-length.constants';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import FormRow from '../../../shared/layout/FormLayout';

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
    </>
  );
};

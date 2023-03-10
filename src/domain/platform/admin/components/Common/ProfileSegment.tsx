import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { LONG_TEXT_LENGTH, MID_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import FormRow from '../../../../shared/layout/FormLayout';

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
        <FormikMarkdownField
          name="description"
          title={t('components.profileSegment.description.name')}
          placeholder={t('components.profileSegment.description.placeholder')}
          rows={10}
          multiline
          disabled={disabled}
          withCounter
          maxLength={LONG_TEXT_LENGTH}
          required={required}
        />
      </FormRow>
    </>
  );
};

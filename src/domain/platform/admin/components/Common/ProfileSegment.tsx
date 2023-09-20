import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  ALT_TEXT_LENGTH,
  VERY_LONG_TEXT_LENGTH,
  MID_TEXT_LENGTH,
} from '../../../../../core/ui/forms/field-length.constants';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import FormRow from '../../../../../core/ui/forms/FormRow';
import MarkdownValidator from '../../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import FormikInputField from '../../../../../core/ui/forms/FormikInputField/FormikInputField';

export const profileSegmentSchema = yup.object().shape({
  avatar: yup.string().max(MID_TEXT_LENGTH),
  description: MarkdownValidator(VERY_LONG_TEXT_LENGTH),
  tagline: yup.string().max(ALT_TEXT_LENGTH),
});

interface ProfileSegmentProps {
  disabled?: boolean;
  required?: boolean;
}

export const ProfileSegment: FC<ProfileSegmentProps> = ({ disabled = false, required = false }) => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow>
        <FormikInputField
          name="tagline"
          title={t('components.profileSegment.tagline.name')}
          placeholder={t('components.profileSegment.tagline.placeholder')}
          disabled={disabled}
          withCounter
          maxLength={ALT_TEXT_LENGTH}
          required={required}
        />
      </FormRow>
      <FormRow>
        <FormikMarkdownField
          name="description"
          title={t('components.profileSegment.description.name')}
          placeholder={t('components.profileSegment.description.placeholder')}
          rows={10}
          multiline
          disabled={disabled}
          maxLength={VERY_LONG_TEXT_LENGTH}
          required={required}
        />
      </FormRow>
    </>
  );
};

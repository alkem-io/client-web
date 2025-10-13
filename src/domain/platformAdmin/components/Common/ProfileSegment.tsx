import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { ALT_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH, MID_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import Gutters from '@/core/ui/grid/Gutters';
import { referenceSegmentValidationObject } from './ReferenceSegment';
import { socialNames } from '@/domain/shared/components/SocialLinks/models/SocialNetworks';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

const commonProfileValidationProps = {
  displayName: displayNameValidator.required(),
  avatar: textLengthValidator({ maxLength: MID_TEXT_LENGTH }),
  description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  tagline: textLengthValidator({ maxLength: ALT_TEXT_LENGTH }).nullable(),
};

export const profileSegmentSchema = yup.object().shape({
  ...commonProfileValidationProps,
});

export const profileSegmentSchemaWithReferences = yup.object().shape({
  ...commonProfileValidationProps,
  references: yup.array().of(
    referenceSegmentValidationObject.shape({
      name: yup
        .string()
        .test(
          'includesSocial',
          'Use the social section',
          value => !value || !socialNames.includes(value.toLowerCase())
        ),
    })
  ),
});

interface ProfileSegmentProps {
  disabled?: boolean;
  required?: boolean;
}

export const ProfileSegment: FC<ProfileSegmentProps> = ({ disabled = false, required = false }) => {
  const { t } = useTranslation();

  return (
    <Gutters disablePadding>
      <FormikInputField
        name="profile.tagline"
        title={t('components.profileSegment.tagline.name')}
        placeholder={t('components.profileSegment.tagline.placeholder')}
        disabled={disabled}
        maxLength={ALT_TEXT_LENGTH}
        required={required}
      />
      <FormikMarkdownField
        name="profile.description"
        title={t('components.profileSegment.description.name')}
        placeholder={t('components.profileSegment.description.placeholder')}
        rows={10}
        multiline
        disabled={disabled}
        maxLength={MARKDOWN_TEXT_LENGTH}
        required={required}
      />
    </Gutters>
  );
};

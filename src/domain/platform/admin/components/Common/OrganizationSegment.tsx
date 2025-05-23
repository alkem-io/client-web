import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import Gutters from '@/core/ui/grid/Gutters';

export const organizationSegmentSchema = yup.object().shape({
  contactEmail: yup.string().email('Not a valid email').max(SMALL_TEXT_LENGTH),
  domain: yup.string().max(SMALL_TEXT_LENGTH),
  legalEntityName: yup.string().max(SMALL_TEXT_LENGTH),
  website: yup.string().url('Not a valid url').max(SMALL_TEXT_LENGTH),
  verified: yup.string(),
});

interface OrganizationSegmentProps {
  disabled?: boolean;
  required?: boolean;
}

export const OrganizationSegment: FC<OrganizationSegmentProps> = ({ disabled = false, required = false }) => {
  const { t } = useTranslation();

  return (
    <Gutters disablePadding>
      <FormikInputField
        name="contactEmail"
        title={t('components.organizationSegment.contactEmail.name')}
        placeholder={t('components.organizationSegment.contactEmail.placeholder')}
        disabled={disabled}
        required={required}
      />
      <FormikInputField
        name="website"
        title={t('components.organizationSegment.website.name')}
        placeholder={t('components.organizationSegment.website.placeholder')}
        disabled={disabled}
        required={required}
      />
      <FormikInputField
        name="domain"
        title={t('components.organizationSegment.domain.name')}
        placeholder={t('components.organizationSegment.domain.placeholder')}
        disabled={disabled}
        required={required}
      />
      <FormikInputField
        name="legalEntityName"
        title={t('components.organizationSegment.legalEntityName.name')}
        placeholder={t('components.organizationSegment.legalEntityName.placeholder')}
        disabled={disabled}
        required={required}
      />
      <FormikInputField
        name="verified"
        title={t('components.organizationSegment.verified.name')}
        placeholder={t('components.organizationSegment.verified.placeholder')}
        disabled
      />
    </Gutters>
  );
};

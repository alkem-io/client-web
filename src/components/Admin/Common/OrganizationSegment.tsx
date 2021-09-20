import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useInputField } from './useInputField';
import { SMALL_TEXT_LENGTH } from '../../../models/constants/field-length.constants';

export const organizationegmentSchema = yup.object().shape({
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
  const getInputField = useInputField();
  return (
    <>
      {getInputField({
        name: 'contactEmail',
        label: t('components.organizationSegment.contactEmail.name'),
        placeholder: t('components.organizationSegment.contactEmail.placeholder'),
        disabled: disabled,
        required: required,
      })}
      {getInputField({
        name: 'domain',
        label: t('components.organizationSegment.domain.name'),
        placeholder: t('components.organizationSegment.domain.placeholder'),
        disabled: disabled,
        required: required,
      })}
      {getInputField({
        name: 'legalEntityName',
        label: t('components.organizationSegment.legalEntityName.name'),
        placeholder: t('components.organizationSegment.legalEntityName.placeholder'),
        disabled: disabled,
        required: required,
      })}
      {getInputField({
        name: 'website',
        label: t('components.organizationSegment.website.name'),
        placeholder: t('components.organizationSegment.website.placeholder'),
        disabled: disabled,
        required: required,
      })}
      {getInputField({
        name: 'verified',
        label: t('components.organizationSegment.verified.name'),
        placeholder: t('components.organizationSegment.verified.placeholder'),
        disabled: true,
      })}
    </>
  );
};

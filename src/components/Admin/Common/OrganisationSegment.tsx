import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useInputField } from './useInputField';
import { SMALL_TEXT_LENGTH } from '../../../models/constants/field-length.constants';

export const organisationegmentSchema = yup.object().shape({
  contactEmail: yup.string().email('Not a valid email').max(SMALL_TEXT_LENGTH),
  domain: yup.string().max(SMALL_TEXT_LENGTH),
  legalEntityName: yup.string().max(SMALL_TEXT_LENGTH),
  website: yup.string().url('Not a valid url').max(SMALL_TEXT_LENGTH),
  verified: yup.string(),
});

interface OrganisationSegmentProps {
  disabled?: boolean;
  required?: boolean;
}

export const OrganisationSegment: FC<OrganisationSegmentProps> = ({ disabled = false, required = false }) => {
  const { t } = useTranslation();
  const getInputField = useInputField();
  return (
    <>
      {getInputField({
        name: 'contactEmail',
        label: t('components.organisationSegment.contactEmail.name'),
        placeholder: t('components.organisationSegment.contactEmail.placeholder'),
        disabled: disabled,
        required: required,
      })}
      {getInputField({
        name: 'domain',
        label: t('components.organisationSegment.domain.name'),
        placeholder: t('components.organisationSegment.domain.placeholder'),
        disabled: disabled,
        required: required,
      })}
      {getInputField({
        name: 'legalEntityName',
        label: t('components.organisationSegment.legalEntityName.name'),
        placeholder: t('components.organisationSegment.legalEntityName.placeholder'),
        disabled: disabled,
        required: required,
      })}
      {getInputField({
        name: 'website',
        label: t('components.organisationSegment.website.name'),
        placeholder: t('components.organisationSegment.website.placeholder'),
        disabled: disabled,
        required: required,
      })}
      {getInputField({
        name: 'verified',
        label: t('components.organisationSegment.verified.name'),
        placeholder: t('components.organisationSegment.verified.placeholder'),
        disabled: true,
      })}
    </>
  );
};

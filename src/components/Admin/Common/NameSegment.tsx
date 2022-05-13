import i18next from 'i18next';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormRow from '../../../domain/shared/layout/FormLayout';
import FormikInputFieldField from '../../composite/forms/FormikInputField';

export const nameValidator = yup
  .string()
  .required(i18next.t('forms.validations.required'))
  .min(3, 'Name should be at least 3 symbols long')
  .max(128, 'Exceeded the limit of 128 characters');

export const nameIdValidator = yup
  .string()
  .required(i18next.t('forms.validations.required'))
  .min(3, 'NameID should be at least 3 symbols long')
  .max(25, 'Exceeded the limit of 25 characters')
  .matches(/^[a-z0-9-]*$/, 'NameID can contain only lower case latin characters, numbers and hyphens');

export const nameSegmentSchema = yup.object().shape({
  name: nameValidator,
  nameID: nameIdValidator,
});

interface NameSegmentProps {
  disabled: boolean;
  required: boolean;
  nameHelpText?: string;
  nameIDHelpText?: string;
  loading?: boolean;
}

export const NameSegment: FC<NameSegmentProps> = ({ disabled, required, nameHelpText, nameIDHelpText, loading }) => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow>
        <FormikInputFieldField
          name="name"
          title={t('components.nameSegment.name')}
          required
          helpText={nameHelpText}
          loading={loading}
        />
      </FormRow>
      <FormRow>
        <FormikInputFieldField
          name="nameID"
          title={t('components.nameSegment.nameID.title')}
          placeholder={t('components.nameSegment.nameID.placeholder')}
          disabled={disabled}
          required={required}
          helpText={nameIDHelpText}
          loading={loading}
        />
      </FormRow>
    </>
  );
};

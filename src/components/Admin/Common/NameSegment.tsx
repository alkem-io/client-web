import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormRow from '../../../domain/shared/layout/FormLayout';
import FormikInputFieldField from '../../composite/forms/FormikInputField';
import { displayNameValidator, nameIdValidator } from '../../../utils/validator';

export const nameSegmentSchema = yup.object().shape({
  name: displayNameValidator,
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

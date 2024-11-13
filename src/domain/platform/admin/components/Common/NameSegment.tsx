import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormRow from '@core/ui/forms/FormRow';
import FormikInputFieldField from '@core/ui/forms/FormikInputField/FormikInputField';
import { displayNameValidator } from '@core/ui/forms/validator';
import nonReservedNameIdValidator from '@main/routing/nonReservedNameIdValidator';

export const nameSegmentSchema = yup.object().shape({
  name: displayNameValidator,
  nameID: nonReservedNameIdValidator,
});

interface NameSegmentProps {
  disabled: boolean;
  required: boolean;
  nameHelpText?: string;
  nameIDHelpText?: string;
  nameFieldName?: string;
  nameIdFieldName?: string;
  loading?: boolean;
}

export const NameSegment: FC<NameSegmentProps> = ({
  disabled,
  required,
  nameHelpText,
  nameIDHelpText,
  nameFieldName = 'name',
  nameIdFieldName = 'nameID',
  loading,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow>
        <FormikInputFieldField
          name={nameFieldName}
          title={t('components.nameSegment.name')}
          required
          helpIconText={nameHelpText}
          loading={loading}
        />
      </FormRow>
      <FormRow>
        <FormikInputFieldField
          name={nameIdFieldName}
          title={t('components.nameSegment.nameID.title')}
          placeholder={t('components.nameSegment.nameID.placeholder')}
          disabled={disabled}
          required={required}
          helpIconText={nameIDHelpText}
          loading={loading}
        />
      </FormRow>
    </>
  );
};

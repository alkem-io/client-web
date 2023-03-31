import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormRow from '../../../../shared/layout/FormLayout';
import FormikInputFieldField from '../../../../../common/components/composite/forms/FormikInputField';
import { displayNameValidator, nameIdValidator } from '../../../../../common/utils/validator';

export const nameSegmentSchema = yup.object().shape({
  name: displayNameValidator,
  nameID: nameIdValidator,
});

interface NameSegmentProps {
  disabled: boolean;
  required: boolean;
  nameHelpText?: string;
  nameIDHelpText?: string;
  formikFieldName_Name?: string;
  formikFieldName_NameId?: string;
  loading?: boolean;
}

export const NameSegment: FC<NameSegmentProps> = ({
  disabled,
  required,
  nameHelpText,
  nameIDHelpText,
  formikFieldName_Name = 'name',
  formikFieldName_NameId = 'nameID',
  loading,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow>
        <FormikInputFieldField
          name={formikFieldName_Name}
          title={t('components.nameSegment.name')}
          required
          helpIconText={nameHelpText}
          loading={loading}
        />
      </FormRow>
      <FormRow>
        <FormikInputFieldField
          name={formikFieldName_NameId}
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

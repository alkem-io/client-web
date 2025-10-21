import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import nonReservedNameIdValidator from '@/core/ui/forms/validator/nonReservedNameIdValidator';

export const nameSegmentSchema = yup.object().shape({
  displayName: displayNameValidator({ required: true }),
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
      <FormikInputField
        name={nameFieldName}
        title={t('components.nameSegment.name')}
        required
        helpIconText={nameHelpText}
        loading={loading}
      />
      <FormikInputField
        name={nameIdFieldName}
        title={t('components.nameSegment.nameID.title')}
        placeholder={t('components.nameSegment.nameID.placeholder')}
        disabled={disabled}
        required={required}
        helpIconText={nameIDHelpText}
        loading={loading}
      />
    </>
  );
};

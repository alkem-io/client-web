import i18next from 'i18next';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useInputField } from './useInputField';

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
}

export const NameSegment: FC<NameSegmentProps> = ({ disabled, required, nameHelpText, nameIDHelpText }) => {
  const { t } = useTranslation();
  const getInputField = useInputField();
  return (
    <>
      {getInputField({ name: 'name', label: t('components.nameSegment.name'), required: true, helpText: nameHelpText })}
      {getInputField({
        name: 'nameID',
        label: t('components.nameSegment.nameID.title'),
        placeholder: t('components.nameSegment.nameID.placeholder'),
        disabled: disabled,
        required: required,
        helpText: nameIDHelpText,
      })}
    </>
  );
};

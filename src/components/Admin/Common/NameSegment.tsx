import i18next from 'i18next';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useInputField } from './useInputField';

export const nameSegmentSchema = yup.object().shape({
  name: yup.string().required(i18next.t('forms.validations.required')),
  nameID: yup
    .string()
    .required(i18next.t('forms.validations.required'))
    .min(3, 'NameID should be at least 3 symbols long')
    .max(25, 'Exceeded the limit of 25 characters')
    .matches(/^\S*$/, 'nameID cannot contain spaces'),
});

interface NameSegmentProps {
  disabled: boolean;
  required: boolean;
}

export const NameSegment: FC<NameSegmentProps> = ({ disabled, required }) => {
  const { t } = useTranslation();
  const getInputField = useInputField();
  return (
    <>
      {getInputField({ name: 'name', label: t('components.nameSegment.name'), required: true })}
      {getInputField({
        name: 'nameID',
        label: t('components.nameSegment.nameID.title'),
        placeholder: t('components.nameSegment.nameID.placeholder'),
        disabled: disabled,
        required: required,
      })}
    </>
  );
};

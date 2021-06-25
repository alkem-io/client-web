import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useInputField } from './useInputField';

export const profileSegmentSchema = yup.object().shape({
  name: yup.string().required(),
  nameID: yup
    .string()
    .required()
    .min(3, 'NameID should be at least 3 symbols long')
    .max(25, 'Exceeded the limit of 25 characters')
    .matches(/^\S*$/, 'nameID cannot contain spaces'),
});

interface ProfileSegmentProps {
  disabled: boolean;
  required: boolean;
}

export const ProfileSegment: FC<ProfileSegmentProps> = ({ disabled, required }) => {
  const { t } = useTranslation();
  const getInputField = useInputField();
  return (
    <>
      {getInputField({ name: 'name', label: t('components.profileSegment.name'), required: true })}
      {getInputField({
        name: 'nameID',
        label: t('components.profileSegment.nameID.title'),
        placeholder: t('components.profileSegment.nameID.placeholder'),
        disabled: disabled,
        required: required,
      })}
    </>
  );
};

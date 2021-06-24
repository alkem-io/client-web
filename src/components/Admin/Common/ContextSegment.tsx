import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useInputField } from './useInputField';
import * as yup from 'yup';

export const contextFragmentSchema = yup.object().shape({
  background: yup.string(), // .required(t('forms.validations.required')),
  impact: yup.string(), // .required(t('forms.validations.required')),
  tagline: yup.string(), // .required(t('forms.validations.required')),
  vision: yup.string(), // .required(t('forms.validations.required')),
  who: yup.string(), // .required(t('forms.validations.required')),
});

interface ContextSegmentProps {}

export const ContextSegment: FC<ContextSegmentProps> = () => {
  const { t } = useTranslation();
  const getInputField = useInputField();
  return (
    <>
      {getInputField({ name: 'tagline', label: t('components.contextSegment.tagline') })}
      {getInputField({ name: 'background', label: t('components.contextSegment.background'), rows: 3 })}
      {getInputField({ name: 'impact', label: t('components.contextSegment.impact'), rows: 3 })}
      {getInputField({ name: 'vision', label: t('components.contextSegment.vision'), rows: 3 })}
      {getInputField({ name: 'who', label: t('components.contextSegment.who'), rows: 3 })}
    </>
  );
};

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useInputField } from './useInputField';
import * as yup from 'yup';
import { useMarkdownInputField } from './useMarkdownInputField';

export const contextFragmentSchema = yup.object().shape({
  background: yup.string(),
  impact: yup.string(),
  tagline: yup.string(),
  vision: yup.string(),
  who: yup.string(),
});

interface ContextSegmentProps {}

export const ContextSegment: FC<ContextSegmentProps> = () => {
  const { t } = useTranslation();
  const getInputField = useInputField();
  const getMarkdownInput = useMarkdownInputField();
  return (
    <>
      {getInputField({ name: 'tagline', label: t('components.contextSegment.tagline') })}
      {getInputField({ name: 'background', label: t('components.contextSegment.background'), rows: 3 })}
      {getMarkdownInput({ name: 'impact', label: 'Impact', rows: 10 })}
      {getMarkdownInput({ name: 'vision', label: 'Vision', rows: 10 })}
      {getInputField({ name: 'who', label: t('components.contextSegment.who'), rows: 3 })}
    </>
  );
};

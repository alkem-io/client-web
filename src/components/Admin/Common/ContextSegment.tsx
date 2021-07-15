import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useInputField } from './useInputField';
import * as yup from 'yup';
import { useMarkdownInputField } from './useMarkdownInputField';

export const contextSegmentSchema = yup.object().shape({
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
      {getInputField({ name: 'tagline', label: t('components.contextSegment.tagline'), rows: 3 })}
      {getMarkdownInput({ name: 'background', label: t('components.contextSegment.background'), rows: 10 })}
      {getMarkdownInput({ name: 'impact', label: t('components.contextSegment.impact'), rows: 10 })}
      {getMarkdownInput({ name: 'vision', label: t('components.contextSegment.vision'), rows: 10 })}
      {getMarkdownInput({ name: 'who', label: t('components.contextSegment.who'), rows: 10 })}
    </>
  );
};

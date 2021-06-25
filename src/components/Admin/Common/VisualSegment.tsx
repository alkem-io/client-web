import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useInputField } from './useInputField';
import * as yup from 'yup';

export const visualFragmentSchema = yup.object().shape({
  avatar: yup.string(),
  background: yup.string(),
  banner: yup.string(),
});

interface VisualSegmentProps {}

export const VisualSegment: FC<VisualSegmentProps> = () => {
  const { t } = useTranslation();
  const getInputField = useInputField();
  return (
    <>
      {getInputField({ name: 'visual.avatar', label: t('components.visualSegment.avatar') })}
      {getInputField({ name: 'visual.background', label: t('components.visualSegment.background') })}
      {getInputField({ name: 'visual.banner', label: t('components.visualSegment.banner') })}
    </>
  );
};

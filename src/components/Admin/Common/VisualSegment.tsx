import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InputField from './InputField';
import * as yup from 'yup';

export const visualSegmentSchema = yup.object().shape({
  avatar: yup.string(),
  background: yup.string(),
  banner: yup.string(),
});

interface VisualSegmentProps {}

export const VisualSegment: FC<VisualSegmentProps> = () => {
  const { t } = useTranslation();

  return (
    <>
      <InputField name="visual.avatar" label={t('components.visualSegment.avatar')} />
      <InputField name="visual.background" label={t('components.visualSegment.background')} />
      <InputField name="visual.banner" label={t('components.visualSegment.banner')} />
    </>
  );
};

import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { LONG_TEXT_LENGTH } from '../../../models/constants/field-length.constants';
import MarkdownInput from './MarkdownInput';

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

  return (
    <>
      <MarkdownInput
        name="vision"
        label={t('components.contextSegment.vision.title')}
        tooltipLabel={t('components.contextSegment.vision.tooltip')}
        rows={10}
        maxLength={LONG_TEXT_LENGTH}
        withCounter
      />
      <MarkdownInput
        name="background"
        label={t('components.contextSegment.background.title')}
        tooltipLabel={t('components.contextSegment.background.tooltip')}
        rows={10}
        maxLength={LONG_TEXT_LENGTH}
        withCounter
      />
      <MarkdownInput
        name="impact"
        label={t('components.contextSegment.impact.title')}
        tooltipLabel={t('components.contextSegment.impact.tooltip')}
        rows={10}
        maxLength={LONG_TEXT_LENGTH}
        withCounter
      />
      <MarkdownInput
        name="who"
        label={t('components.contextSegment.who.title')}
        tooltipLabel={t('components.contextSegment.who.tooltip')}
        rows={10}
        maxLength={LONG_TEXT_LENGTH}
        withCounter
      />
    </>
  );
};

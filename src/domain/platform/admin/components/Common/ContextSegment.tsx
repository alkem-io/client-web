import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { LONG_TEXT_LENGTH } from '../../../../../models/constants/field-length.constants';
import { JourneyType } from '../../../../challenge/JourneyType';
import MarkdownInput from './MarkdownInput';

export const contextSegmentSchema = yup.object().shape({
  background: yup.string(),
  impact: yup.string(),
  tagline: yup.string(),
  vision: yup.string(),
  who: yup.string(),
});

export interface ContextSegmentProps {}

export const ContextSegment: FC<ContextSegmentProps & { contextType: JourneyType }> = ({ contextType }) => {
  const { t } = useTranslation();

  return (
    <>
      <MarkdownInput
        name="vision"
        label={t(`context.${contextType}.vision.title` as const)}
        tooltipLabel={t(`context.${contextType}.vision.tooltip` as const)}
        rows={10}
        maxLength={LONG_TEXT_LENGTH}
        withCounter
      />
      <MarkdownInput
        name="background"
        label={t(`context.${contextType}.background.title` as const)}
        tooltipLabel={t(`context.${contextType}.background.tooltip` as const)}
        rows={10}
        maxLength={LONG_TEXT_LENGTH}
        withCounter
      />
      <MarkdownInput
        name="impact"
        label={t(`context.${contextType}.impact.title` as const)}
        tooltipLabel={t(`context.${contextType}.impact.tooltip` as const)}
        rows={10}
        maxLength={LONG_TEXT_LENGTH}
        withCounter
      />
      <MarkdownInput
        name="who"
        label={t(`context.${contextType}.who.title` as const)}
        tooltipLabel={t(`context.${contextType}.who.tooltip` as const)}
        rows={10}
        maxLength={LONG_TEXT_LENGTH}
        withCounter
      />
    </>
  );
};

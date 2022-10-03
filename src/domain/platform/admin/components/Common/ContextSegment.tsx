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

interface ContextSegmentProps {
  contextType: JourneyType;
}

export const ContextSegment: FC<ContextSegmentProps> = ({ contextType }) => {
  const { t } = useTranslation();

  return (
    <>
      <MarkdownInput
        name="vision"
        label={t(`components.contextSegment.${contextType}.vision.title` as const)}
        tooltipLabel={t(`components.contextSegment.${contextType}.vision.tooltip` as const)}
        rows={10}
        maxLength={LONG_TEXT_LENGTH}
        withCounter
      />
      <MarkdownInput
        name="background"
        label={t(`components.contextSegment.${contextType}.background.title` as const)}
        tooltipLabel={t(`components.contextSegment.${contextType}.background.tooltip` as const)}
        rows={10}
        maxLength={LONG_TEXT_LENGTH}
        withCounter
      />
      <MarkdownInput
        name="impact"
        label={t(`components.contextSegment.${contextType}.impact.title` as const)}
        tooltipLabel={t(`components.contextSegment.${contextType}.impact.tooltip` as const)}
        rows={10}
        maxLength={LONG_TEXT_LENGTH}
        withCounter
      />
      <MarkdownInput
        name="who"
        label={t(`components.contextSegment.${contextType}.who.title` as const)}
        tooltipLabel={t(`components.contextSegment.${contextType}.who.tooltip` as const)}
        rows={10}
        maxLength={LONG_TEXT_LENGTH}
        withCounter
      />
    </>
  );
};

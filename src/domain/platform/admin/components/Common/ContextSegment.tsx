import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { MARKDOWN_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import { JourneyType } from '../../../../challenge/JourneyType';
import SectionSpacer from '../../../../shared/components/Section/SectionSpacer';
import MarkdownInput from './MarkdownInput';

export const contextSegmentSchema = yup.object().shape({
  background: yup.string(),
  impact: yup.string(),
  tagline: yup.string(),
  vision: yup.string(),
  who: yup.string(),
});

export interface ContextSegmentProps {
  loading?: boolean;
}

export const ContextSegment: FC<ContextSegmentProps & { contextType: JourneyType }> = ({ loading, contextType }) => {
  const { t } = useTranslation();

  return (
    <>
      <MarkdownInput
        name="vision"
        label={t(`context.${contextType}.vision.title` as const)}
        helperText={t(`context.${contextType}.vision.description` as const)}
        rows={10}
        maxLength={MARKDOWN_TEXT_LENGTH}
        loading={loading}
        withCounter
      />
      <SectionSpacer />
      <MarkdownInput
        name="background"
        label={t(`context.${contextType}.background.title` as const)}
        helperText={t(`context.${contextType}.background.description` as const)}
        rows={10}
        maxLength={MARKDOWN_TEXT_LENGTH}
        loading={loading}
        withCounter
      />
      <SectionSpacer />
      <MarkdownInput
        name="impact"
        label={t(`context.${contextType}.impact.title` as const)}
        helperText={t(`context.${contextType}.impact.description` as const)}
        rows={10}
        maxLength={MARKDOWN_TEXT_LENGTH}
        loading={loading}
        withCounter
      />
      <SectionSpacer />
      <MarkdownInput
        name="who"
        label={t(`context.${contextType}.who.title` as const)}
        helperText={t(`context.${contextType}.who.description` as const)}
        rows={10}
        maxLength={MARKDOWN_TEXT_LENGTH}
        loading={loading}
        withCounter
      />
    </>
  );
};

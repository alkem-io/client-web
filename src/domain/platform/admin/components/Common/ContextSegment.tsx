import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { JourneyTypeName } from '../../../../journey/JourneyTypeName';
import SectionSpacer from '../../../../shared/components/Section/SectionSpacer';
import MarkdownInput from './MarkdownInput';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';

export const contextSegmentSchema = yup.object().shape({
  background: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  impact: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  vision: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  who: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  tagline: yup.string().max(SMALL_TEXT_LENGTH),
});

export interface ContextSegmentProps {
  loading?: boolean;
}

export const ContextSegment: FC<ContextSegmentProps & { contextType: JourneyTypeName }> = ({
  loading,
  contextType,
}) => {
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
      />
      <SectionSpacer />
      <MarkdownInput
        name="background"
        label={t(`context.${contextType}.background.title` as const)}
        helperText={t(`context.${contextType}.background.description` as const)}
        rows={10}
        maxLength={MARKDOWN_TEXT_LENGTH}
        loading={loading}
      />
      <SectionSpacer />
      <MarkdownInput
        name="impact"
        label={t(`context.${contextType}.impact.title` as const)}
        helperText={t(`context.${contextType}.impact.description` as const)}
        rows={10}
        maxLength={MARKDOWN_TEXT_LENGTH}
        loading={loading}
      />
      <SectionSpacer />
      <MarkdownInput
        name="who"
        label={t(`context.${contextType}.who.title` as const)}
        helperText={t(`context.${contextType}.who.description` as const)}
        rows={10}
        maxLength={MARKDOWN_TEXT_LENGTH}
        loading={loading}
      />
    </>
  );
};

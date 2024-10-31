import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

import MarkdownInput from './MarkdownInput';
import SectionSpacer from '../../../../shared/components/Section/SectionSpacer';

import { JourneyTypeName } from '../../../../journey/JourneyTypeName';
import MarkdownValidator from '../../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';

export const contextSegmentSchema = yup.object().shape({
  who: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  tagline: yup.string().max(SMALL_TEXT_LENGTH),
  impact: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  vision: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  background: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
});

export const ContextSegment = ({ loading, contextType }: ContextSegmentProps & { contextType: JourneyTypeName }) => {
  const { t } = useTranslation();

  return (
    <>
      <MarkdownInput
        rows={10}
        name="vision"
        loading={loading}
        maxLength={MARKDOWN_TEXT_LENGTH}
        label={t(`context.${contextType}.vision.title` as const)}
        helperText={t(`context.${contextType}.vision.description` as const)}
      />

      <SectionSpacer />

      <MarkdownInput
        rows={10}
        name="background"
        loading={loading}
        maxLength={MARKDOWN_TEXT_LENGTH}
        label={t(`context.${contextType}.background.title` as const)}
        helperText={t(`context.${contextType}.background.description` as const)}
      />

      <SectionSpacer />

      <MarkdownInput
        rows={10}
        name="impact"
        loading={loading}
        maxLength={MARKDOWN_TEXT_LENGTH}
        label={t(`context.${contextType}.impact.title` as const)}
        helperText={t(`context.${contextType}.impact.description` as const)}
      />

      <SectionSpacer />

      <MarkdownInput
        rows={10}
        name="who"
        loading={loading}
        maxLength={MARKDOWN_TEXT_LENGTH}
        label={t(`context.${contextType}.who.title` as const)}
        helperText={t(`context.${contextType}.who.description` as const)}
      />
    </>
  );
};

export interface ContextSegmentProps {
  loading?: boolean;
}

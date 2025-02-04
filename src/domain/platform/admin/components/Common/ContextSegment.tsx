import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import Gutters from '@/core/ui/grid/Gutters';

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

export const ContextSegment = ({ loading, spaceLevel }: ContextSegmentProps & { spaceLevel: SpaceLevel }) => {
  const { t } = useTranslation();

  return (
    <Gutters>
      <FormikMarkdownField
        name="vision"
        title={t(`context.${spaceLevel}.vision.title` as const)}
        placeholder={t(`context.${spaceLevel}.vision.title` as const)}
        helperText={t(`context.${spaceLevel}.vision.description` as const)}
        rows={10}
        maxLength={MARKDOWN_TEXT_LENGTH}
        loading={loading}
      />
      <FormikMarkdownField
        name="background"
        title={t(`context.${spaceLevel}.background.title` as const)}
        placeholder={t(`context.${spaceLevel}.background.title` as const)}
        helperText={t(`context.${spaceLevel}.background.description` as const)}
        rows={10}
        maxLength={MARKDOWN_TEXT_LENGTH}
        loading={loading}
      />
      <FormikMarkdownField
        name="impact"
        title={t(`context.${spaceLevel}.impact.title` as const)}
        placeholder={t(`context.${spaceLevel}.impact.title` as const)}
        helperText={t(`context.${spaceLevel}.impact.description` as const)}
        rows={10}
        maxLength={MARKDOWN_TEXT_LENGTH}
        loading={loading}
      />
      <FormikMarkdownField
        name="who"
        title={t(`context.${spaceLevel}.who.title` as const)}
        placeholder={t(`context.${spaceLevel}.who.title` as const)}
        helperText={t(`context.${spaceLevel}.who.description` as const)}
        rows={10}
        maxLength={MARKDOWN_TEXT_LENGTH}
        loading={loading}
      />
    </Gutters>
  );
};

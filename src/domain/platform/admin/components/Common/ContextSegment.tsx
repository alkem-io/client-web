import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import Gutters from '@/core/ui/grid/Gutters';

export const spaceAboutSegmentSchema = yup.object().shape({
  description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  when: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  why: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  who: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  tagline: yup.string().max(SMALL_TEXT_LENGTH),
});

export interface ContextSegmentProps {
  loading?: boolean;
}

export const ContextSegment = ({ loading, spaceLevel }: ContextSegmentProps & { spaceLevel: SpaceLevel }) => {
  const { t } = useTranslation();

  return (
    <Gutters disablePadding>
      <Gutters disableGap disablePadding>
        <FormikMarkdownField
          name="description"
          title={t(`context.${spaceLevel}.description.title` as const)}
          placeholder={t(`context.${spaceLevel}.description.title` as const)}
          helperText={t(`context.${spaceLevel}.description.description` as const)}
          rows={10}
          maxLength={MARKDOWN_TEXT_LENGTH}
          loading={loading}
        />
      </Gutters>
      <Gutters row disablePadding>
        <FormikMarkdownField
          name="why"
          title={t(`context.${spaceLevel}.why.title` as const)}
          placeholder={t(`context.${spaceLevel}.why.title` as const)}
          helperText={t(`context.${spaceLevel}.why.description` as const)}
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
    </Gutters>
  );
};

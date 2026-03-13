import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import type { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownFieldLazy';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { useScreenSize } from '@/core/ui/grid/constants';
import Gutters from '@/core/ui/grid/Gutters';

export const spaceAboutSegmentSchema = yup.object().shape({
  description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  when: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  why: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  who: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  tagline: textLengthValidator({ maxLength: SMALL_TEXT_LENGTH }),
});

export interface ContextSegmentProps {
  loading?: boolean;
}

export const SpaceAboutSegment = ({ loading, spaceLevel }: ContextSegmentProps & { spaceLevel: SpaceLevel }) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();
  return (
    <Gutters disablePadding={true}>
      <Gutters id="description" disableGap={true} disablePadding={true}>
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
      <Gutters disablePadding={true} row={!isMediumSmallScreen}>
        <Box id="why" flex={1} minWidth={0}>
          <FormikMarkdownField
            name="why"
            title={t(`context.${spaceLevel}.why.title` as const)}
            placeholder={t(`context.${spaceLevel}.why.title` as const)}
            helperText={t(`context.${spaceLevel}.why.description` as const)}
            rows={10}
            maxLength={MARKDOWN_TEXT_LENGTH}
            loading={loading}
          />
        </Box>

        <Box id="who" flex={1} minWidth={0}>
          <FormikMarkdownField
            name="who"
            title={t(`context.${spaceLevel}.who.title` as const)}
            placeholder={t(`context.${spaceLevel}.who.title` as const)}
            helperText={t(`context.${spaceLevel}.who.description` as const)}
            rows={10}
            maxLength={MARKDOWN_TEXT_LENGTH}
            loading={loading}
          />
        </Box>
      </Gutters>
    </Gutters>
  );
};

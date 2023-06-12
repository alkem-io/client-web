import { FC } from 'react';
import { TemplatePreviewBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { PostTemplateWithValue } from '../PostTemplateCard/PostTemplate';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { Box, useTheme } from '@mui/material';
import stopPropagationFromLinks from '../../../../core/ui/utils/stopPropagationFromLinks';

interface PostTemplatePreviewProps extends TemplatePreviewBaseProps<PostTemplateWithValue> {}

const PostTemplatePreview: FC<PostTemplatePreviewProps> = ({ template }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <BlockSectionTitle sx={{ marginBottom: 1.5 }}>
        {t('components.callout-creation.template-step.post-template-default-description')}
      </BlockSectionTitle>

      <Box
        paddingX={1.5}
        paddingY={1}
        onClick={stopPropagationFromLinks}
        border={`1px solid ${theme.palette.divider}`}
        borderRadius={`${theme.shape.borderRadius}px`}
      >
        <WrapperMarkdown>{template?.defaultDescription ?? ''}</WrapperMarkdown>
      </Box>
      {/*
        // Type is not visible in the design, but it's a property from the Cards that we may want to enable in the future,
        // the rest of the code is ready to handle it, it's just hidden:

        <BlockTitle>{t('components.callout-creation.template-step.type')}</BlockTitle>
        <BlockSectionTitle>{template?.type}</BlockSectionTitle>
      */}
    </>
  );
};

export default PostTemplatePreview;

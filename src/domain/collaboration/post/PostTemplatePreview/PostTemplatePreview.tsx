import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Skeleton, styled, Typography } from '@mui/material';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';

export interface PostPreviewProps {
  description: string;
  tags: string[] | undefined;
  postTemplateType: string;
  defaultDescription: string;
  loading: boolean | undefined;
}

/**
 * @deprecated
 * TODO figure out if can be replaced with src/domain/collaboration/post/PostTemplatesLibrary/PostTemplatePreview.tsx
 */
const PostTemplatePreview: FC<PostPreviewProps> = ({
  description,
  tags,
  postTemplateType,
  defaultDescription,
  loading,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <TypographyTitle>{t('common.description')}</TypographyTitle>
        <Typography variant="body2" component="div">
          {loading ? (
            <>
              <Skeleton />
              <Skeleton />
            </>
          ) : (
            <WrapperMarkdown>{description}</WrapperMarkdown>
          )}
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('common.tags')}</TypographyTitle>
        <SectionSpacer half />
        <TagsComponent tags={tags || []} loading={loading} />
      </Box>
      <Box>
        <TypographyTitle>{t('post-edit.type.title')}</TypographyTitle>
        <Typography variant="h6" color="primary">
          {loading ? <Skeleton width="30%" /> : postTemplateType}
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('post-templates.default-description')}</TypographyTitle>
        <Typography variant="body2" component="div">
          {loading ? <Skeleton /> : <WrapperMarkdown>{defaultDescription}</WrapperMarkdown>}
        </Typography>
      </Box>
    </>
  );
};

export default PostTemplatePreview;

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));

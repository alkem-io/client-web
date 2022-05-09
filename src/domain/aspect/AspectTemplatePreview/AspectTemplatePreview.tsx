import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Skeleton, styled, Typography } from '@mui/material';
import Markdown from '../../../common/components/core/Markdown';
import { SectionSpacer } from '../../shared/components/Section/Section';
import TagsComponent from '../../shared/components/TagsComponent/TagsComponent';

export interface AspectPreviewProps {
  description: string;
  tags: string[] | undefined;
  aspectTemplateType: string;
  defaultDescription: string;
  loading: boolean | undefined;
}

const AspectTemplatePreview: FC<AspectPreviewProps> = ({
  description,
  tags,
  aspectTemplateType,
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
            <Markdown>{description}</Markdown>
          )}
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('common.tags')}</TypographyTitle>
        <SectionSpacer half />
        <TagsComponent tags={tags || []} loading={loading} />
      </Box>
      <Box>
        <TypographyTitle>{t('aspect-edit.type.title')}</TypographyTitle>
        <Typography variant="h6" color="primary">
          {loading ? <Skeleton width="30%" /> : aspectTemplateType}
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('aspect-templates.default-description')}</TypographyTitle>
        <Typography variant="body2" component="div">
          {loading ? <Skeleton /> : <Markdown>{defaultDescription}</Markdown>}
        </Typography>
      </Box>
    </>
  );
};
export default AspectTemplatePreview;

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));

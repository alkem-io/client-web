import { Box, styled, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminAspectTemplateFragment } from '../../../../../models/graphql-schema';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import { SectionSpacer } from '../../../../shared/components/Section/Section';
import WrapperMarkdown from '../../../../../common/components/core/WrapperMarkdown';

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));

interface AspectTemplateViewProps {
  template: AdminAspectTemplateFragment;
}

const AspectTemplateView = ({ template }: AspectTemplateViewProps) => {
  const { t } = useTranslation();

  const {
    info: { tagset: { tags } = {}, description = '' },
    type: templateType,
    defaultDescription,
  } = template;

  return (
    <>
      <Box>
        <TypographyTitle>{t('common.description')}</TypographyTitle>
        <Typography variant="body2" component="div">
          <WrapperMarkdown>{description}</WrapperMarkdown>
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('common.tags')}</TypographyTitle>
        <SectionSpacer half />
        <TagsComponent tags={tags || []} />
      </Box>
      <Box>
        <TypographyTitle>{t('aspect-edit.type.title')}</TypographyTitle>
        <Typography variant="h6" color="primary">
          {templateType}
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('aspect-templates.default-description')}</TypographyTitle>
        <Typography variant="body2" component="div">
          <WrapperMarkdown>{defaultDescription}</WrapperMarkdown>
        </Typography>
      </Box>
    </>
  );
};

export default AspectTemplateView;

import { Box, styled, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminCalloutTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import WrapperMarkdown from '../../../../../core/ui/markdown/WrapperMarkdown';
import Gutters from '../../../../../core/ui/grid/Gutters';

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));

interface CalloutTemplateViewProps {
  template: AdminCalloutTemplateFragment;
}

const CalloutTemplateView = ({ template }: CalloutTemplateViewProps) => {
  const { t } = useTranslation();

  const {
    profile: { tagset: { tags } = {}, description = '' },
    type: templateType,
  } = template;

  return (
    <Gutters>
      <Box>
        <TypographyTitle>{t('common.description')}</TypographyTitle>
        <Typography variant="body2" component="div">
          <WrapperMarkdown>{description}</WrapperMarkdown>
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('common.tags')}</TypographyTitle>
        <TagsComponent tags={tags || []} />
      </Box>
      <Box>
        <TypographyTitle>{t('templateLibrary.calloutTemplates.type')}</TypographyTitle>
        <Typography variant="h6" color="primary">
          {templateType}
        </Typography>
      </Box>
    </Gutters>
  );
};

export default CalloutTemplateView;

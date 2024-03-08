import { Box, styled, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminInnovationFlowTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import WrapperMarkdown from '../../../../../core/ui/markdown/WrapperMarkdown';
import InnovationFlowVisualizer from './InnovationFlowVisualizer';

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));

interface PostInnovationViewProps {
  template: AdminInnovationFlowTemplateFragment;
}

const InnovationTemplateView = ({ template }: PostInnovationViewProps) => {
  const { t } = useTranslation();

  const {
    profile: { tagset: { tags } = {}, description = '' },
    states,
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
        <TagsComponent tags={tags || []} />
      </Box>
      <Box>
        <TypographyTitle>{t('innovation-templates.states.title')}</TypographyTitle>
        <Typography variant="body2" component="div">
          <InnovationFlowVisualizer states={states} />
        </Typography>
      </Box>
    </>
  );
};

export default InnovationTemplateView;

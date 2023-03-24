import { Box, styled, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLifecycleTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import { SectionSpacer } from '../../../../shared/components/Section/Section';
import WrapperMarkdown from '../../../../../core/ui/markdown/WrapperMarkdown';
import { SafeInnovationFlowVisualizer } from './SafeInnovationFlowVisualizer';

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));

interface AspectInnovationViewProps {
  template: AdminLifecycleTemplateFragment;
  // TODO: Add getTemplateValue here and apply the same lazyQuery aproach it's done on Canvases if we don't want to load the full IF definition in the index query
}

const InnovationTemplateView = ({ template }: AspectInnovationViewProps) => {
  const { t } = useTranslation();

  const {
    profile: { tagset: { tags } = {}, description = '' },
    type: templateType,
    definition = '',
  } = template;

  console.log(template);

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
        <TypographyTitle>{t('innovation-templates.type.title')}</TypographyTitle>
        <Typography variant="h6" color="primary">
          {templateType}
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('innovation-templates.definition.title')}</TypographyTitle>
        <Typography variant="body2" component="div">
          <SafeInnovationFlowVisualizer definition={definition} />
        </Typography>
      </Box>
    </>
  );
};

export default InnovationTemplateView;

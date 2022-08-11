import { Box, Button, Dialog, DialogActions, DialogContent, DialogProps, styled, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLifecycleTemplateFragment } from '../../../../models/graphql-schema';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import { Link } from 'react-router-dom';
import Markdown from '../../../../components/core/Markdown';
import { SafeLifecycleVisualizer } from './SafeLifecycleVisualizer';

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));

interface AspectInnovationViewProps {
  template: AdminLifecycleTemplateFragment;
  open: boolean;
  onClose: DialogProps['onClose'];
  editUrl: string;
  editLinkState?: Record<string, unknown>;
}

const InnovationTemplateView = ({ template, open, onClose, editUrl, editLinkState }: AspectInnovationViewProps) => {
  const { t } = useTranslation();

  const {
    info: { title, visual, tagset: { tags } = {}, description = '' },
    type: templateType,
    definition = '',
  } = template;

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { backgroundColor: 'background.default' } }}>
      {visual?.uri && <img src={visual.uri} alt={description} />}
      <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box display="flex" minWidth={theme => theme.spacing(46)} justifyContent="space-between" alignItems="center">
          <Typography variant="h5" color="primary" fontWeight="bold">
            {title}
          </Typography>
          <DialogActions sx={{ p: 0 }}>
            <Button component={Link} variant="contained" to={editUrl} state={editLinkState}>
              {t('common.update')}
            </Button>
          </DialogActions>
        </Box>
        <Box>
          <TypographyTitle>{t('common.description')}</TypographyTitle>
          <Typography variant="body2" component="div">
            <Markdown>{description}</Markdown>
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
            <SafeLifecycleVisualizer definition={definition} />
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default InnovationTemplateView;

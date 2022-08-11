import { Box, Button, DialogActions, DialogContent, DialogProps, styled, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminAspectTemplateFragment } from '../../../../models/graphql-schema';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import { Link } from 'react-router-dom';
import Markdown from '../../../../components/core/Markdown';
import DialogWhiteBg from '../../../shared/components/DialogWhiteBg';

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));

interface AspectTemplateViewProps {
  template: AdminAspectTemplateFragment;
  open: boolean;
  onClose: DialogProps['onClose'];
  editUrl: string;
  editLinkState?: Record<string, unknown>;
}

const AspectTemplateView = ({ template, open, onClose, editUrl, editLinkState }: AspectTemplateViewProps) => {
  const { t } = useTranslation();

  const {
    info: { title, visual, tagset: { tags } = {}, description = '' },
    type: templateType,
    defaultDescription,
  } = template;

  return (
    <DialogWhiteBg open={open} onClose={onClose}>
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
          <TypographyTitle>{t('aspect-edit.type.title')}</TypographyTitle>
          <Typography variant="h6" color="primary">
            {templateType}
          </Typography>
        </Box>
        <Box>
          <TypographyTitle>{t('aspect-templates.default-description')}</TypographyTitle>
          <Typography variant="body2" component="div">
            <Markdown>{defaultDescription}</Markdown>
          </Typography>
        </Box>
      </DialogContent>
    </DialogWhiteBg>
  );
};

export default AspectTemplateView;

import { Box, Button, Dialog, DialogActions, DialogContent, DialogProps, Paper, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { Visual } from '../../../../models/graphql-schema';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import ImageComponent from '../../../shared/components/ImageComponent';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import { useTheme } from '@mui/styles';
import { Link } from 'react-router-dom';
import Markdown from '../../../../components/core/Markdown';

interface AspectTemplateViewProps {
  title: string;
  templateType: string;
  description: string;
  defaultDescription: string;
  tags: string[] | undefined;
  visual: Visual;
  open: boolean;
  onClose: DialogProps['onClose'];
  editUrl: string;
  editLinkState?: Record<string, unknown>;
}

const AspectTemplateView = ({
  title,
  templateType,
  description,
  defaultDescription,
  tags,
  visual,
  open,
  onClose,
  editUrl,
  editLinkState,
}: AspectTemplateViewProps) => {
  const { t } = useTranslation();

  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{ sx: { backgroundColor: 'background.default' } }}
    >
      <DialogContent sx={{ p: 2, display: 'flex', gap: 2 }}>
        <Paper elevation={4} sx={{ px: 3, py: 1, alignSelf: 'start' }}>
          <SchoolOutlinedIcon sx={{ fontSize: theme => theme.spacing(12) }} color="primary" />
        </Paper>
        <Box pb={6}>
          <Box display="flex" minWidth={theme => theme.spacing(46)} justifyContent="space-between" alignItems="start">
            <Box>
              <Typography variant="h5" color="primary" fontWeight="bold">
                {title}
              </Typography>
              <Typography variant="h6" color="primary">
                {templateType}
              </Typography>
            </Box>
            <DialogActions sx={{ p: 0 }}>
              <Button component={Link} variant="contained" to={editUrl} state={editLinkState}>
                {t('common.update')}
              </Button>
            </DialogActions>
          </Box>
          <SectionSpacer half />
          <Typography variant="h6">{t('common.description')}</Typography>
          <Typography variant="body2">
            <Markdown>{description}</Markdown>
          </Typography>
          <SectionSpacer half />
          <Typography variant="h6">{t('aspect-templates.default-description')}</Typography>
          <Typography variant="body2">
            <Markdown>{defaultDescription}</Markdown>
          </Typography>
          <SectionSpacer half />
          <Typography variant="h6">{t('common.tags')}</Typography>
          <TagsComponent tags={tags || []} />
          {tags && tags.length >= 1 && <SectionSpacer half />}
          <Typography variant="h6">
            {t('common.visuals')} ({t('aspect-templates.banner-narrow')})
          </Typography>
          <ImageComponent src={visual.uri} width={theme.spacing(11 * visual.aspectRatio)} height={theme.spacing(11)} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AspectTemplateView;

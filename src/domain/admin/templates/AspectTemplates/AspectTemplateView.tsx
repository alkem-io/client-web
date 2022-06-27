import { Box, Button, Dialog, DialogActions, DialogContent, DialogProps, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Visual } from '../../../../models/graphql-schema';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { SectionSpacer } from '../../../shared/components/Section/Section';
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

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { backgroundColor: 'background.default' } }}>
      {visual.uri && <img src={visual.uri} />}
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
          <Typography variant="h6">{t('common.description')}</Typography>
          <Typography variant="body2" component="div">
            <Markdown>{description}</Markdown>
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6">{t('common.tags')}</Typography>
          <SectionSpacer half />
          <TagsComponent tags={tags || []} />
        </Box>
        <Box>
          <Typography variant="h6">{t('aspect-edit.type.title')}</Typography>
          <Typography variant="h6" color="primary">
            {templateType}
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6">{t('aspect-templates.default-description')}</Typography>
          <Typography variant="body2" component="div">
            <Markdown>{defaultDescription}</Markdown>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AspectTemplateView;

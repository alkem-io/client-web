import { Box, Button, Dialog, DialogActions, DialogContent, DialogProps, styled, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminCanvasTemplateFragment } from '../../../../models/graphql-schema';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import { Link } from 'react-router-dom';
import Markdown from '../../../../components/core/Markdown';
import CanvasWhiteboard from '../../../../components/composite/entities/Canvas/CanvasWhiteboard';

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));

interface CanvasTemplateViewProps {
  template: AdminCanvasTemplateFragment;
  open: boolean;
  onClose: DialogProps['onClose'];
  editUrl: string;
  editLinkState?: Record<string, unknown>;
}

const CanvasTemplatePreview = ({ template, open, onClose, editUrl, editLinkState }: CanvasTemplateViewProps) => {
  const { t } = useTranslation();

  const {
    info: { title, visual, tagset: { tags } = {}, description = '' },
    value,
  } = template;

  const canvasFromTemplate = useMemo(() => {
    return {
      id: '__template',
      value,
    };
  }, [value]);

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
        <Box height={theme => theme.spacing(40)}>
          {value && (
            <CanvasWhiteboard
              entities={{
                canvas: canvasFromTemplate,
              }}
              actions={{}}
              options={{
                viewModeEnabled: true,
                UIOptions: {
                  canvasActions: {
                    export: false,
                  },
                },
              }}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CanvasTemplatePreview;

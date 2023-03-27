import { Box, Button, Grid, Skeleton, useTheme } from '@mui/material';
import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { WhiteboardTemplateWithValue } from './WhiteboardTemplate';
import WhiteboardTemplateCard from './WhiteboardTemplateCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { BlockSectionTitle } from '../../../../core/ui/typography/components';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import CanvasWhiteboard from '../../../../common/components/composite/entities/Canvas/CanvasWhiteboard';

export interface WhiteboardTemplatesLibraryPreviewProps {
  onClose: () => void;
  template?: WhiteboardTemplateWithValue;
  loading?: boolean;
  importedTemplateValue?: string | undefined;
  actions?: ReactNode;
}

const WhiteboardTemplatesLibraryPreview: FC<WhiteboardTemplatesLibraryPreviewProps> = ({
  template,
  loading,
  actions,
  onClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <GridProvider columns={3}>
          <WhiteboardTemplateCard template={template} loading={loading} />
        </GridProvider>
        <Box sx={{ display: 'flex', marginY: theme.spacing(2), justifyContent: 'end' }}>
          <Button startIcon={<ArrowBackIcon />} variant="text" onClick={() => onClose()}>
            {t('buttons.back')}
          </Button>
          {actions}
        </Box>
      </Grid>
      <Grid item xs={12} sm={9}>
        <Box>
          <BlockSectionTitle>{t('common.description')}</BlockSectionTitle>
          <WrapperMarkdown>{template?.description || ''}</WrapperMarkdown>
          {loading && <Skeleton />}
        </Box>
        <Box>
          <BlockSectionTitle>{t('common.tags')}</BlockSectionTitle>
          <TagsComponent tags={template?.tags ?? []} />
          {loading && <Skeleton />}
        </Box>
        <Box height={theme.spacing(40)}>
          {template?.value ? (
            <CanvasWhiteboard
              entities={{
                canvas: template,
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
          ) : (
            <Skeleton height={theme.spacing(40)} />
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default WhiteboardTemplatesLibraryPreview;

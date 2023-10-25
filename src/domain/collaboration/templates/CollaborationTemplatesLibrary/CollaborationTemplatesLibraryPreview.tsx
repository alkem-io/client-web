import { Box, Button, Grid, Skeleton, useTheme } from '@mui/material';
import { ComponentType, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { BlockSectionTitle } from '../../../../core/ui/typography/components';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { TemplateBase, TemplateBaseWithContent, TemplateCardBaseProps, TemplatePreviewBaseProps } from './TemplateBase';

export interface CollaborationTemplatesLibraryPreviewProps<
  Template extends TemplateBase,
  TemplateValue extends TemplateBaseWithContent
> {
  onClose: () => void;
  template?: TemplateValue;
  templateCardComponent: ComponentType<TemplateCardBaseProps<Template>>;
  templatePreviewComponent: ComponentType<TemplatePreviewBaseProps<TemplateValue>>;
  templateInfo?: ReactNode;
  loading?: boolean;
  actions?: ReactNode;
}

const CollaborationTemplatesLibraryPreview = <
  Template extends TemplateBase,
  TemplateValue extends TemplateBaseWithContent
>({
  template,
  templateCardComponent: TemplateCard,
  templatePreviewComponent: TemplatePreview,
  templateInfo,
  loading,
  actions,
  onClose,
}: CollaborationTemplatesLibraryPreviewProps<Template, TemplateValue>) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <GridProvider columns={3}>
          <TemplateCard template={template as Template | undefined} loading={loading} />
          {templateInfo}
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
          <BlockSectionTitle sx={{ marginBottom: 1.5 }}>{t('common.tags')}</BlockSectionTitle>
          <TagsComponent tags={template?.tags ?? []} />
          {loading && <Skeleton />}
        </Box>
        <Box height={theme.spacing(40)}>
          {!loading ? <TemplatePreview template={template} /> : <Skeleton height={theme.spacing(40)} />}
        </Box>
      </Grid>
    </Grid>
  );
};

export default CollaborationTemplatesLibraryPreview;

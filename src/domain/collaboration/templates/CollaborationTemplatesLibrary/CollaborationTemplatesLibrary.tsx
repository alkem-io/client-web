import { Button, Dialog, DialogContent, Link } from '@mui/material';
import { ComponentType, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LibraryIcon } from '../../../../common/icons/LibraryIcon';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import CollaborationTemplatesLibraryGallery from './CollaborationTemplatesLibraryGallery';
import CollaborationTemplatesLibraryPreview from './CollaborationTemplatesLibraryPreview';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import Gutters from '../../../../core/ui/grid/Gutters';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogIcon from '../../../../core/ui/dialog/DialogIcon';
import { ImageSearch as ImageSearchIcon } from '@mui/icons-material';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import { TemplateBase, TemplateBaseWithValue, TemplateCardBaseProps, TemplatePreviewBaseProps } from './TemplateBase';

export interface CollaborationTemplatesLibraryProps<
  Template extends TemplateBase,
  TemplateWithValue extends TemplateBaseWithValue
> {
  dialogTitle: string;
  onSelectTemplate: (template: TemplateWithValue) => void;
  // Components:
  templateCardComponent: ComponentType<TemplateCardBaseProps<Template>>;
  templatePreviewComponent: ComponentType<TemplatePreviewBaseProps<TemplateWithValue>>;

  // Filtering
  filter?: string[];
  onFilterChange: (terms: string[]) => void;

  // Data
  fetchSpaceTemplatesOnLoad?: boolean;
  fetchTemplatesFromSpace?: () => void;
  templatesFromSpace?: Template[];
  loadingTemplatesFromSpace?: boolean;
  loadingTemplateValueFromSpace?: boolean;
  fetchTemplateFromSpaceValue?: (template: Template) => Promise<TemplateWithValue | undefined>;

  fetchTemplatesFromPlatform?: () => void;
  templatesFromPlatform?: Template[];
  loadingTemplatesFromPlatform?: boolean;
  loadingTemplateValueFromPlatform?: boolean;
  fetchTemplateFromPlatformValue?: (template: Template) => Promise<TemplateWithValue | undefined>;
}

const CollaborationTemplatesLibrary = <Template extends TemplateBase, TemplateWithValue extends TemplateBaseWithValue>({
  dialogTitle,
  onSelectTemplate,
  templateCardComponent,
  templatePreviewComponent,
  filter = [],
  onFilterChange,
  fetchSpaceTemplatesOnLoad,
  fetchTemplatesFromSpace,
  templatesFromSpace,
  loadingTemplatesFromSpace,
  loadingTemplateValueFromSpace,
  fetchTemplateFromSpaceValue,
  fetchTemplatesFromPlatform,
  templatesFromPlatform,
  loadingTemplatesFromPlatform,
  loadingTemplateValueFromPlatform,
  fetchTemplateFromPlatformValue,
}: CollaborationTemplatesLibraryProps<Template, TemplateWithValue>) => {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleClose = () => {
    setDialogOpen(false);
    handleClosePreview();
  };

  // Show gallery or show preview of this template:
  const [previewTemplate, setPreviewTemplate] = useState<TemplateWithValue>();

  // Load Space Templates by default:
  useEffect(() => {
    if (fetchTemplatesFromSpace && fetchSpaceTemplatesOnLoad) {
      fetchTemplatesFromSpace();
    }
  }, [fetchTemplatesFromSpace, fetchSpaceTemplatesOnLoad]);

  const handlePreviewTemplateSpace = async (template: Template) => {
    setPreviewTemplate(await fetchTemplateFromSpaceValue?.(template));
  };

  // Load Platform Templates if no spaceName is provided:
  useEffect(() => {
    if (fetchTemplatesFromPlatform && !fetchSpaceTemplatesOnLoad) {
      fetchTemplatesFromPlatform();
    }
  }, [fetchTemplatesFromPlatform, fetchSpaceTemplatesOnLoad]);

  const handlePreviewTemplatePlatform = async (template: Template) => {
    setPreviewTemplate(await fetchTemplateFromPlatformValue?.(template));
  };

  const handleClosePreview = () => {
    setPreviewTemplate(undefined);
  };

  const handleSelectTemplate = () => {
    if (previewTemplate) {
      onSelectTemplate(previewTemplate);
      handleClose();
    }
  };

  const loading =
    loadingTemplatesFromSpace ||
    loadingTemplatesFromPlatform ||
    loadingTemplateValueFromSpace ||
    loadingTemplateValueFromPlatform;
  const loadingPreview = loadingTemplateValueFromSpace || loadingTemplateValueFromPlatform;

  return (
    <>
      <Button variant="outlined" startIcon={<LibraryIcon />} onClick={() => setDialogOpen(true)}>
        {t('buttons.find-template')}
      </Button>
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        PaperProps={{ sx: { backgroundColor: 'background.default', width: theme => theme.spacing(150) } }}
        maxWidth={false}
        fullWidth
      >
        <DialogHeader onClose={handleClose} titleContainerProps={{ alignItems: 'center' }}>
          <DialogIcon>
            <LibraryIcon />
          </DialogIcon>
          {dialogTitle}
          <MultipleSelect
            onChange={onFilterChange}
            value={filter}
            minLength={2}
            containerProps={{
              marginLeft: 'auto',
            }}
            size="small"
          />
        </DialogHeader>
        <DialogContent>
          {!previewTemplate && !loadingPreview ? (
            <Gutters>
              {templatesFromSpace && (
                <>
                  <BlockTitle>{t('whiteboard-templates.space-templates')}</BlockTitle>
                  <CollaborationTemplatesLibraryGallery
                    templates={templatesFromSpace}
                    templateCardComponent={templateCardComponent}
                    onPreviewTemplate={template => handlePreviewTemplateSpace(template)}
                    loading={loadingTemplatesFromSpace}
                  />
                </>
              )}
              {!templatesFromPlatform && !loadingTemplatesFromPlatform && fetchTemplatesFromPlatform ? (
                <Link
                  component={Caption}
                  onClick={() => fetchTemplatesFromPlatform()}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ cursor: 'pointer' }}
                >
                  <ImageSearchIcon /> {t('whiteboard-templates.load-platform-templates')}
                </Link>
              ) : (
                <>
                  <BlockTitle>{t('whiteboard-templates.platform-templates')}</BlockTitle>
                  <CollaborationTemplatesLibraryGallery
                    templates={templatesFromPlatform}
                    templateCardComponent={templateCardComponent}
                    onPreviewTemplate={template => handlePreviewTemplatePlatform(template)}
                    loading={loadingTemplatesFromPlatform}
                  />
                </>
              )}
            </Gutters>
          ) : (
            <CollaborationTemplatesLibraryPreview
              template={previewTemplate}
              templateCardComponent={templateCardComponent}
              templatePreviewComponent={templatePreviewComponent}
              loading={loadingPreview}
              onClose={handleClosePreview}
              actions={
                <Button
                  startIcon={<SystemUpdateAltIcon />}
                  variant="contained"
                  sx={{ marginLeft: theme => theme.spacing(1) }}
                  disabled={loading}
                  onClick={handleSelectTemplate}
                >
                  {t('buttons.use')}
                </Button>
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CollaborationTemplatesLibrary;

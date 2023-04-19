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
import MultipleSelect from '../../../platform/search/MultipleSelect';
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
  fetchHubTemplatesOnLoad?: boolean;
  fetchTemplatesFromHub?: () => void;
  templatesFromHub?: Template[];
  loadingTemplatesFromHub?: boolean;
  loadingTemplateValueFromHub?: boolean;
  fetchTemplateFromHubValue?: (template: Template) => Promise<TemplateWithValue | undefined>;

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
  fetchHubTemplatesOnLoad,
  fetchTemplatesFromHub,
  templatesFromHub,
  loadingTemplatesFromHub,
  loadingTemplateValueFromHub,
  fetchTemplateFromHubValue,
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

  // Load Hub Templates by default:
  useEffect(() => {
    if (fetchTemplatesFromHub && fetchHubTemplatesOnLoad) {
      fetchTemplatesFromHub();
    }
  }, [fetchTemplatesFromHub, fetchHubTemplatesOnLoad]);

  const handlePreviewTemplateHub = async (template: Template) => {
    setPreviewTemplate(await fetchTemplateFromHubValue?.(template));
  };

  // Load Platform Templates if no hubName is provided:
  useEffect(() => {
    if (fetchTemplatesFromPlatform && !fetchHubTemplatesOnLoad) {
      fetchTemplatesFromPlatform();
    }
  }, [fetchTemplatesFromPlatform, fetchHubTemplatesOnLoad]);

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
    loadingTemplatesFromHub ||
    loadingTemplatesFromPlatform ||
    loadingTemplateValueFromHub ||
    loadingTemplateValueFromPlatform;
  const loadingPreview = loadingTemplateValueFromHub || loadingTemplateValueFromPlatform;

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
            inputProps={{ size: 'small' }}
          />
        </DialogHeader>
        <DialogContent>
          {!previewTemplate && !loadingPreview ? (
            <Gutters>
              {templatesFromHub && (
                <>
                  <BlockTitle>{t('canvas-templates.hub-templates')}</BlockTitle>
                  <CollaborationTemplatesLibraryGallery
                    templates={templatesFromHub}
                    templateCardComponent={templateCardComponent}
                    onPreviewTemplate={template => handlePreviewTemplateHub(template)}
                    loading={loadingTemplatesFromHub}
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
                  <ImageSearchIcon /> {t('canvas-templates.load-platform-templates')}
                </Link>
              ) : (
                <>
                  <BlockTitle>{t('canvas-templates.platform-templates')}</BlockTitle>
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

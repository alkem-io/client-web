import { Button, ButtonProps, Dialog, DialogContent, Link } from '@mui/material';
import React, { ComponentType, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LibraryIcon } from '../LibraryIcon';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import CollaborationTemplatesLibraryGallery from './CollaborationTemplatesLibraryGallery';
import CollaborationTemplatesLibraryPreview from './CollaborationTemplatesLibraryPreview';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import Gutters from '../../../../core/ui/grid/Gutters';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogIcon from '../../../../core/ui/dialog/DialogIcon';
import { ImageSearch as ImageSearchIcon } from '@mui/icons-material';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import { TemplateBase, TemplateBaseWithContent, TemplateCardBaseProps, TemplatePreviewBaseProps } from './TemplateBase';

export interface CollaborationTemplatesLibraryProps<
  Template extends TemplateBase,
  TemplateWithContent extends TemplateBaseWithContent
> {
  dialogTitle: string;
  onSelectTemplate: (template: TemplateWithContent) => void;
  // Components:
  templateCardComponent: ComponentType<TemplateCardBaseProps<Template>>;
  templatePreviewComponent: ComponentType<TemplatePreviewBaseProps<TemplateWithContent>>;

  // Filtering
  filter?: string[];
  onFilterChange: (terms: string[]) => void;

  // Data
  fetchSpaceTemplatesOnLoad?: boolean;
  fetchTemplatesFromSpace?: () => void;
  templatesFromSpace?: Template[];
  loadingTemplatesFromSpace?: boolean;

  // Whiteboard template content
  loadingWhiteboardTemplateContent?: boolean;
  getWhiteboardTemplateWithContent?: (template: Template) => Promise<TemplateWithContent | undefined>;

  fetchTemplatesFromPlatform?: () => void;
  templatesFromPlatform?: Template[];
  loadingTemplatesFromPlatform?: boolean;

  buttonProps?: ButtonProps;
}

const CollaborationTemplatesLibrary = <
  Template extends TemplateBase,
  TemplateWithValue extends TemplateBaseWithContent
>({
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
  loadingWhiteboardTemplateContent,
  getWhiteboardTemplateWithContent,
  fetchTemplatesFromPlatform,
  templatesFromPlatform,
  loadingTemplatesFromPlatform = false,
  buttonProps = {},
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

  const handlePreviewWhiteboardTemplate = async (template: Template) => {
    setPreviewTemplate(await getWhiteboardTemplateWithContent?.(template));
  };

  // Load Platform Templates if no spaceName is provided:
  useEffect(() => {
    if (fetchTemplatesFromPlatform && !fetchSpaceTemplatesOnLoad) {
      fetchTemplatesFromPlatform();
    }
  }, [fetchTemplatesFromPlatform, fetchSpaceTemplatesOnLoad]);

  const handleClosePreview = () => {
    setPreviewTemplate(undefined);
  };

  const handleSelectTemplate = () => {
    if (previewTemplate) {
      onSelectTemplate(previewTemplate);
      handleClose();
    }
  };

  const loading = loadingTemplatesFromSpace || loadingTemplatesFromPlatform || loadingWhiteboardTemplateContent;
  const loadingPreview = loadingWhiteboardTemplateContent;

  if (!buttonProps.children) {
    buttonProps.children = <>{t('buttons.find-template')}</>;
  }

  return (
    <>
      <Button variant="outlined" startIcon={<LibraryIcon />} onClick={() => setDialogOpen(true)} {...buttonProps} />
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
                    onPreviewTemplate={template => handlePreviewWhiteboardTemplate(template)}
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
                    onPreviewTemplate={template => handlePreviewWhiteboardTemplate(template)}
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

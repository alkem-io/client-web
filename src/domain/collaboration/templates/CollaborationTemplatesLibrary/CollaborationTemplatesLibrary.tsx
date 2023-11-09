import { Box, Button, ButtonProps, Dialog, DialogContent, Link } from '@mui/material';
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
import { ImageSearch as ImageSearchIcon, InfoOutlined } from '@mui/icons-material';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import { TemplateBase, TemplateCardBaseProps } from './TemplateBase';
import { gutters } from '../../../../core/ui/grid/utils';
import { Identifiable, Identifiables } from '../../../../core/utils/Identifiable';

enum TemplateSource {
  Space,
  Platform,
}

const DisabledTemplateInfo = () => {
  const { t } = useTranslation();
  return (
    <Box display="flex" gap={gutters(0.5)}>
      <InfoOutlined />
      <Caption>{t('templateLibrary.disabledTemplateInfo')}</Caption>
    </Box>
  );
};

export interface CollaborationTemplatesLibraryProps<
  Template extends TemplateBase,
  TemplateWithContent extends {},
  TemplatePreview extends {}
> {
  dialogTitle: string;
  onImportTemplate: (template: Template & TemplateWithContent) => void;
  // Components:
  templateCardComponent: ComponentType<TemplateCardBaseProps<Template>>;
  templatePreviewComponent: ComponentType<{ template?: TemplatePreview }>;

  // Filtering
  filter?: string[];
  onFilterChange: (terms: string[]) => void;

  // Data
  fetchSpaceTemplatesOnLoad?: boolean;
  fetchTemplatesFromSpace?: () => void;
  templatesFromSpace?: Identifiables<Template>;
  loadingTemplatesFromSpace?: boolean;

  // For big templates like Whiteboards and InnovationFlows that have their content separated
  // TODO decide whether content should be loaded by Preview components (already the case for some Template types)
  loadingTemplateContent?: boolean;
  getTemplateWithContent?: (template: Template & Identifiable) => Promise<(Template & TemplateWithContent) | undefined>;

  fetchTemplatesFromPlatform?: () => void;
  templatesFromPlatform?: Identifiables<Template>;
  loadingTemplatesFromPlatform?: boolean;
  disableUsePlatformTemplates?: boolean;

  buttonProps?: ButtonProps;
}

const CollaborationTemplatesLibrary = <
  Template extends TemplateBase,
  TemplateWithContent extends {},
  TemplatePreview extends {}
>({
  dialogTitle,
  onImportTemplate,
  templateCardComponent,
  templatePreviewComponent,
  filter = [],
  onFilterChange,
  fetchSpaceTemplatesOnLoad,
  fetchTemplatesFromSpace,
  templatesFromSpace,
  loadingTemplatesFromSpace = false,
  loadingTemplateContent = false,
  getTemplateWithContent,
  fetchTemplatesFromPlatform,
  templatesFromPlatform,
  loadingTemplatesFromPlatform = false,
  disableUsePlatformTemplates = false,
  buttonProps = {},
}: CollaborationTemplatesLibraryProps<Template, TemplateWithContent, TemplatePreview>) => {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleClose = () => {
    setDialogOpen(false);
    handleClosePreview();
  };

  // Show gallery or show preview of this template:
  const [previewTemplate, setPreviewTemplate] = useState<Template & TemplateWithContent>();
  const [templateUseDisabled, setTemplateUseDisabled] = useState<boolean>(false);

  // Load Space Templates by default:
  useEffect(() => {
    if (fetchTemplatesFromSpace && fetchSpaceTemplatesOnLoad) {
      fetchTemplatesFromSpace();
    }
  }, [fetchTemplatesFromSpace, fetchSpaceTemplatesOnLoad]);

  const handlePreviewTemplate = async (template: Template & Identifiable, source: TemplateSource) => {
    setTemplateUseDisabled(disableUsePlatformTemplates && source === TemplateSource.Platform);
    setPreviewTemplate(await getTemplateWithContent?.(template));
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
      console.log('previewTemplate: ', previewTemplate);
      onImportTemplate(previewTemplate);
      handleClose();
    }
  };

  const loading = loadingTemplatesFromSpace || loadingTemplatesFromPlatform || loadingTemplateContent;
  const loadingPreview = loadingTemplateContent;

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
                  <BlockTitle>{t('templateLibrary.spaceTemplates')}</BlockTitle>
                  <CollaborationTemplatesLibraryGallery
                    templates={templatesFromSpace}
                    templateCardComponent={templateCardComponent}
                    onPreviewTemplate={template => handlePreviewTemplate(template, TemplateSource.Space)}
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
                  <ImageSearchIcon /> {t('templateLibrary.loadPlatformTemplates')}
                </Link>
              ) : (
                <>
                  <BlockTitle>{t('templateLibrary.platformTemplates')}</BlockTitle>
                  {disableUsePlatformTemplates && <Caption>{t('templateLibrary.platformUseDisabled')} </Caption>}
                  <CollaborationTemplatesLibraryGallery
                    templates={templatesFromPlatform}
                    templateCardComponent={templateCardComponent}
                    onPreviewTemplate={template => handlePreviewTemplate(template, TemplateSource.Platform)}
                    loading={loadingTemplatesFromPlatform}
                  />
                </>
              )}
            </Gutters>
          ) : (
            <CollaborationTemplatesLibraryPreview
              template={previewTemplate as unknown as Template & TemplatePreview}
              templateCardComponent={templateCardComponent}
              templatePreviewComponent={templatePreviewComponent}
              templateInfo={templateUseDisabled ? <DisabledTemplateInfo /> : undefined}
              loading={loadingPreview}
              onClose={handleClosePreview}
              actions={
                <Button
                  startIcon={<SystemUpdateAltIcon />}
                  variant="contained"
                  sx={{ marginLeft: theme => theme.spacing(1) }}
                  disabled={loading || templateUseDisabled}
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

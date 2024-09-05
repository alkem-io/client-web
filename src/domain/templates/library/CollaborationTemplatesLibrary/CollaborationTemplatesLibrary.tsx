import { Button, DialogContent, Link } from '@mui/material';
import React, { ComponentType, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import CollaborationTemplatesLibraryGallery from './CollaborationTemplatesLibraryGallery';
import CollaborationTemplatesLibraryPreview from './CollaborationTemplatesLibraryPreview';
import SearchIcon from '@mui/icons-material/ImageSearch';
import { TemplateBase, TemplateCardBaseProps } from './TemplateBase';
import { identity } from 'lodash';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import { Identifiable, Identifiables } from '../../../../core/utils/Identifiable';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import Gutters from '../../../../core/ui/grid/Gutters';
import Spacer from '../../../../core/ui/content/Spacer';
import { CARLOS_BORDER_RED } from '../../_new/borders';
import DisabledTemplateInfo from '../../_new/components/Dialogs/PreviewTemplateDialog/DisabledTemplateInfo';

enum TemplateSource {
  Space,
  Platform,
}

export interface CollaborationTemplatesLibraryProps<
  Template extends TemplateBase,
  TemplateWithContent extends {},
  TemplatePreview extends {}
> {
  open: boolean;
  onClose: () => void;
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
  /**
   * @deprecated
   */
  loadingTemplateContent?: boolean;
  /**
   * @deprecated
   */
  getTemplateWithContent?: (template: Template & Identifiable) => Promise<(Template & TemplateWithContent) | undefined>;

  fetchTemplatesFromPlatform?: () => void;
  templatesFromPlatform?: Identifiables<Template>;
  loadingTemplatesFromPlatform?: boolean;
  disableUsePlatformTemplates?: boolean;
  confirmationDialog?: ComponentType<{ open: boolean; onClose: () => void; onConfirm: () => void }>;
}
/**
 * @deprecated
 * //!! REMOVE THIS FILE
 */
const CollaborationTemplatesLibrary = <
  Template extends TemplateBase,
  TemplateWithContent extends {},
  TemplatePreview extends {}
>({
  open: isOpen,
  onClose,
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
  getTemplateWithContent = identity,
  fetchTemplatesFromPlatform,
  templatesFromPlatform,
  loadingTemplatesFromPlatform = false,
  disableUsePlatformTemplates = false,
  confirmationDialog: ConfirmationDialog,
}: CollaborationTemplatesLibraryProps<Template, TemplateWithContent, TemplatePreview>) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      if (fetchTemplatesFromSpace && fetchSpaceTemplatesOnLoad) {
        fetchTemplatesFromSpace();
      }
      if (fetchTemplatesFromPlatform) {
        if (!fetchSpaceTemplatesOnLoad || templatesFromSpace?.length === 0) {
          fetchTemplatesFromPlatform();
        }
      }
    }
  }, [isOpen, fetchTemplatesFromSpace, fetchTemplatesFromPlatform, fetchSpaceTemplatesOnLoad, templatesFromSpace]);

  const handleClose = () => {
    onClose();
    handleClosePreview();
  };

  // Show gallery or show preview of this template:
  const [previewTemplate, setPreviewTemplate] = useState<Template & TemplateWithContent>();
  const [templateUseDisabled, setTemplateUseDisabled] = useState<boolean>(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState<boolean>(false);

  const handlePreviewTemplate = async (template: Template & Identifiable, source: TemplateSource) => {
    setTemplateUseDisabled(disableUsePlatformTemplates && source === TemplateSource.Platform);
    setPreviewTemplate(await getTemplateWithContent?.(template));
  };

  const handleClosePreview = () => {
    setPreviewTemplate(undefined);
  };

  const handleSelectTemplate = () => {
    setConfirmationDialogOpen(false);
    if (previewTemplate) {
      onImportTemplate(previewTemplate);
      handleClose();
    }
  };

  const loading = loadingTemplatesFromSpace || loadingTemplatesFromPlatform || loadingTemplateContent;
  const loadingPreview = loadingTemplateContent;

  return (
    <DialogWithGrid open={isOpen} onClose={handleClose} columns={12}>
      <DialogHeader title={dialogTitle} onClose={handleClose} titleContainerProps={{ alignItems: 'center' }}>
        {!previewTemplate && (
          <MultipleSelect
            onChange={onFilterChange}
            value={filter}
            minLength={2}
            containerProps={{
              marginLeft: 'auto',
            }}
            size="small"
            inlineTerms
          />
        )}
      </DialogHeader>
      <DialogContent sx={{ border: CARLOS_BORDER_RED }}>
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
            <Spacer />
            {(!templatesFromPlatform || templatesFromPlatform.length === 0) &&
            !loadingTemplatesFromPlatform &&
            fetchTemplatesFromPlatform ? (
              <Link
                component={Caption}
                onClick={() => fetchTemplatesFromPlatform()}
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ cursor: 'pointer' }}
              >
                <SearchIcon /> {t('templateLibrary.loadPlatformTemplates')}
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
                onClick={ConfirmationDialog ? () => setConfirmationDialogOpen(true) : handleSelectTemplate}
              >
                {t('buttons.use')}
              </Button>
            }
          />
        )}
      </DialogContent>
      {ConfirmationDialog && (
        <ConfirmationDialog
          open={confirmationDialogOpen}
          onClose={() => setConfirmationDialogOpen(false)}
          onConfirm={handleSelectTemplate}
        />
      )}
    </DialogWithGrid>
  );
};

export default CollaborationTemplatesLibrary;

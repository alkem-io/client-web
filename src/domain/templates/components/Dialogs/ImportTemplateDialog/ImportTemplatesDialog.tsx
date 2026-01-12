import { Button, ButtonProps, CircularProgress, DialogActions, DialogContent, Link, Box } from '@mui/material';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { cloneElement, ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImportTemplatesDialogGallery from './ImportTemplatesDialogGallery';
import { LibraryIcon } from '@/domain/templates/LibraryIcon';
import { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { BlockTitle, Caption } from '@/core/ui/typography';
import PreviewTemplateDialog from '@/domain/templates/components/Dialogs/PreviewTemplateDialog/PreviewTemplateDialog';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import {
  useImportTemplateDialogPlatformTemplatesQuery,
  useImportTemplateDialogQuery,
  useSpaceTemplatesManagerQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { gutters } from '@/core/ui/grid/utils';
import SearchIcon from '@mui/icons-material/Search';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import TemplateCard from '@/domain/templates/components/cards/TemplateCard';
import GridProvider from '@/core/ui/grid/GridProvider';
import TemplateActionButton from '@/domain/templates/components/Buttons/TemplateActionButton';

export interface ImportTemplatesOptions {
  /**
   * Filter templates by templateType
   */
  templateType?: TemplateType;

  disableSpaceTemplates?: boolean;
  /**
   * Enables the option to search the entire platform library.
   * first the templates from the space will be shown and the user can click a link to load the platform templates
   * Is forced to true when disableSpaceTemplate is true, or when no spaceId is found in the url
   */
  enablePlatformTemplates?: boolean;
}

interface ImportTemplatesDialogProps extends ImportTemplatesOptions {
  subtitle?: string;
  open: boolean;
  onClose?: () => void;
  onSelectTemplate: (template: AnyTemplate) => Promise<unknown>;
  actionButton?: (template: AnyTemplate) => ReactElement<ButtonProps>;
  selectedTemplateId?: string;
  onRemoveTemplate?: () => Promise<unknown>;
  removeTemplateLoading?: boolean;
}

const ImportTemplatesDialog = ({
  subtitle,
  open,
  onClose,
  disableSpaceTemplates = false,
  enablePlatformTemplates = false,
  onSelectTemplate,
  actionButton,
  templateType,
  selectedTemplateId,
  onRemoveTemplate,
  removeTemplateLoading = false,
}: ImportTemplatesDialogProps) => {
  const { t } = useTranslation();
  const { levelZeroSpaceId } = useUrlResolver();

  const canUseSpaceTemplates = !disableSpaceTemplates && !!levelZeroSpaceId;
  const [loadPlatformTemplates, setLoadPlatformTemplates] = useState(!canUseSpaceTemplates);

  const [previewTemplate, setPreviewTemplate] = useState<AnyTemplate>();
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);

  const [handleImportTemplate, loadingImport] = useLoadingState(async () => {
    if (previewTemplate) {
      await onSelectTemplate(previewTemplate);
    }
    handleClosePreview();
  });

  const handleClosePreview = () => {
    setPreviewTemplate(undefined);
  };

  const handleClose = () => {
    onClose?.();
    handleClosePreview();
  };

  const handleRemoveClick = () => {
    setShowRemoveConfirmation(true);
  };

  const handleConfirmRemove = async () => {
    if (onRemoveTemplate) {
      await onRemoveTemplate();
      setShowRemoveConfirmation(false);
    }
  };

  const { data: templatesSetData } = useSpaceTemplatesManagerQuery({
    variables: { spaceId: levelZeroSpaceId! },
    skip: !open || !canUseSpaceTemplates || !levelZeroSpaceId,
  });
  const templatesSetId = templatesSetData?.lookup.space?.templatesManager?.templatesSet?.id;

  const { data: templatesData, loading: loadingTemplates } = useImportTemplateDialogQuery({
    fetchPolicy: 'network-only',
    variables: {
      templatesSetId: templatesSetId!,
      includeCallout: templateType === TemplateType.Callout,
      includeSpace: templateType === TemplateType.Space,
    },
    skip: !open || disableSpaceTemplates || !templatesSetId,
  });

  const templates = templatesData?.lookup.templatesSet?.templates
    .filter(template => template.type === templateType)
    .map(template => ({ template, innovationPack: undefined }));

  const { data: platformTemplatesData, loading: loadingPlatform } = useImportTemplateDialogPlatformTemplatesQuery({
    variables: {
      templateTypes: templateType ? [templateType] : undefined,
      includeCallout: templateType === TemplateType.Callout,
      includeSpace: templateType === TemplateType.Space,
    },
    skip: !open || !loadPlatformTemplates,
  });
  const platformTemplates = platformTemplatesData?.platform.library.templates;

  // Find the selected template to show at the top
  const selectedTemplate = selectedTemplateId
    ? [...(templates || []), ...(platformTemplates || [])].find(t => t.template.id === selectedTemplateId)
    : undefined;

  useEffect(() => {
    if (!open) {
      return;
    }
    if (disableSpaceTemplates) {
      setLoadPlatformTemplates(true);
      return;
    }
    if (canUseSpaceTemplates && !loadingTemplates && templates?.length === 0) {
      setLoadPlatformTemplates(true);
    }
  }, [open, disableSpaceTemplates, loadingTemplates, templates]);

  return (
    <>
      <DialogWithGrid open={open} columns={12} onClose={handleClose} aria-labelledby="import-templates-dialog">
        <DialogHeader
          id="import-templates-dialog"
          title={
            templateType
              ? t('pages.admin.generic.sections.templates.import.title', {
                  templateType: t(`common.enums.templateType.${templateType}`),
                })
              : t('pages.admin.generic.sections.templates.import.defaultTitle')
          }
          onClose={handleClose}
          icon={<LibraryIcon />}
        />
        <DialogContent>
          {subtitle && <Caption marginBottom={gutters()}>{subtitle}</Caption>}

          {/* Show selected template at the top with Remove button */}
          {selectedTemplate && onRemoveTemplate && (
            <Box display="flex" gap={2} alignItems="flex-start" marginBottom={gutters(2)}>
              <GridProvider columns={12} force>
                <TemplateCard
                  template={selectedTemplate.template}
                  innovationPack={selectedTemplate.innovationPack}
                  onClick={() => setPreviewTemplate(selectedTemplate.template)}
                />
              </GridProvider>
              <Button
                onClick={handleRemoveClick}
                startIcon={<DeleteOutlineIcon />}
                color="error"
                disabled={removeTemplateLoading}
                sx={{ flexShrink: 0, minWidth: 'auto' }}
              >
                {t('buttons.remove')}
              </Button>
            </Box>
          )}

          {canUseSpaceTemplates && (
            <ImportTemplatesDialogGallery
              templates={templates}
              onClickTemplate={template => setPreviewTemplate(template)}
              loading={loadingTemplates}
            />
          )}
          {canUseSpaceTemplates && enablePlatformTemplates && !loadPlatformTemplates && (
            <Link
              component={Caption}
              onClick={() => setLoadPlatformTemplates(true)}
              display="flex"
              alignItems="center"
              gap={1}
              marginY={gutters()}
              sx={{ cursor: 'pointer' }}
            >
              <SearchIcon /> {t('templateLibrary.loadPlatformTemplates')}
            </Link>
          )}
          {loadPlatformTemplates && (
            <ImportTemplatesDialogGallery
              templates={platformTemplates}
              onClickTemplate={template => setPreviewTemplate(template)}
              loading={loadingPlatform}
            >
              <BlockTitle marginY={gutters()}>
                {loadingPlatform && <CircularProgress size={15} sx={{ marginRight: gutters() }} />}
                {t('templateLibrary.platformTemplates')}
              </BlockTitle>
            </ImportTemplatesDialogGallery>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('buttons.cancel')}</Button>
        </DialogActions>
      </DialogWithGrid>
      {previewTemplate && (
        <PreviewTemplateDialog
          open
          template={previewTemplate}
          onClose={handleClosePreview}
          actions={
            actionButton ? (
              cloneElement(actionButton(previewTemplate), {
                onClick: handleImportTemplate,
                loading: loadingImport,
              })
            ) : (
              <TemplateActionButton textKey="buttons.select" onClick={handleImportTemplate} disabled={loadingImport} />
            )
          }
        />
      )}
      {onRemoveTemplate && (
        <ConfirmationDialog
          entities={{
            titleId: 'components.innovationFlowSettings.defaultTemplate.removeConfirmation.title',
            content: t('components.innovationFlowSettings.defaultTemplate.removeConfirmation.description'),
            confirmButtonTextId: 'buttons.remove',
          }}
          actions={{
            onConfirm: handleConfirmRemove,
            onCancel: () => setShowRemoveConfirmation(false),
          }}
          options={{
            show: showRemoveConfirmation,
          }}
          state={{
            isLoading: removeTemplateLoading,
          }}
        />
      )}
    </>
  );
};

export default ImportTemplatesDialog;

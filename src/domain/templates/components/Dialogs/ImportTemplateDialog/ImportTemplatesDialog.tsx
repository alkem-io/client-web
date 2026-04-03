import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, type ButtonProps, CircularProgress, DialogActions, DialogContent, Link } from '@mui/material';
import { cloneElement, type ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useImportTemplateDialogAccountTemplatesQuery,
  useImportTemplateDialogPlatformTemplatesQuery,
  useImportTemplateDialogQuery,
  useSpaceTemplatesManagerQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import GridProvider from '@/core/ui/grid/GridProvider';
import { gutters } from '@/core/ui/grid/utils';
import { BlockTitle, Caption } from '@/core/ui/typography';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import TemplateActionButton from '@/domain/templates/components/Buttons/TemplateActionButton';
import TemplateCard from '@/domain/templates/components/cards/TemplateCard';
import PreviewTemplateDialog from '@/domain/templates/components/Dialogs/PreviewTemplateDialog/PreviewTemplateDialog';
import { LibraryIcon } from '@/domain/templates/LibraryIcon';
import type { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import ImportTemplatesDialogGallery from './ImportTemplatesDialogGallery';

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
  accountId?: string;
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
  accountId,
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

  const { data: accountTemplatesData, loading: loadingAccountTemplates } = useImportTemplateDialogAccountTemplatesQuery(
    {
      variables: {
        accountId: accountId!,
        includeCallout: templateType === TemplateType.Callout,
        includeSpace: templateType === TemplateType.Space,
      },
      skip: !open || !accountId,
    }
  );

  const accountTemplates = accountTemplatesData?.lookup.account?.innovationPacks.flatMap(pack =>
    (pack.templatesSet?.templates ?? [])
      .filter(template => template.type === templateType)
      .map(template => ({
        template,
        innovationPack: {
          id: pack.id,
          profile: pack.profile,
          provider: pack.provider,
        },
      }))
  );

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
    ? [...(templates || []), ...(accountTemplates || []), ...(platformTemplates || [])].find(
        templateItem => templateItem.template.id === selectedTemplateId
      )
    : undefined;

  useEffect(() => {
    if (!open) {
      return;
    }
    if (disableSpaceTemplates && !accountId) {
      setLoadPlatformTemplates(true);
      return;
    }
    const spaceEmpty = canUseSpaceTemplates && !loadingTemplates && templates?.length === 0;
    const accountEmpty = !accountId || (!loadingAccountTemplates && accountTemplates?.length === 0);
    const noSpaceContext = !canUseSpaceTemplates;

    if ((spaceEmpty || noSpaceContext) && accountEmpty) {
      setLoadPlatformTemplates(true);
    }
  }, [open, disableSpaceTemplates, loadingTemplates, templates, loadingAccountTemplates, accountTemplates, accountId]);

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
            <Box display="flex" flexDirection="column" marginBottom={gutters(2)}>
              <Box paddingY={gutters(1)}>
                <BlockTitle>{t('components.innovationFlowSettings.defaultTemplate.currentlySelected')}</BlockTitle>
              </Box>
              <Box display="flex" flexDirection="row">
                <Box display="flex" flexDirection="column" alignItems="flex-end" gap={gutters(1)} width={245}>
                  <GridProvider columns={1} force={true}>
                    <TemplateCard
                      template={selectedTemplate.template}
                      innovationPack={selectedTemplate.innovationPack}
                      isSelected={true}
                      onClick={() => setPreviewTemplate(selectedTemplate.template)}
                    />
                  </GridProvider>
                  <Box
                    display="flex"
                    flexDirection="row"
                    gap="10px"
                    onClick={removeTemplateLoading ? undefined : handleRemoveClick}
                    sx={{
                      cursor: removeTemplateLoading ? 'default' : 'pointer',
                      opacity: removeTemplateLoading ? 0.5 : 1,
                      background: 'none',
                      border: 'none',
                      padding: 0,
                    }}
                    component="button"
                    aria-label={t('buttons.remove')}
                    disabled={removeTemplateLoading}
                  >
                    <DeleteOutlineIcon sx={{ color: '#B30000', width: gutters(1.05), height: gutters(1.05) }} />
                    <BlockTitle sx={{ color: '#B30000' }}>{t('buttons.remove')}</BlockTitle>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {canUseSpaceTemplates && (
            <ImportTemplatesDialogGallery
              templates={templates}
              onClickTemplate={template => setPreviewTemplate(template)}
              loading={loadingTemplates}
            />
          )}
          {accountId && (loadingAccountTemplates || (accountTemplates && accountTemplates.length > 0)) && (
            <ImportTemplatesDialogGallery
              templates={accountTemplates}
              onClickTemplate={template => setPreviewTemplate(template)}
              loading={loadingAccountTemplates}
            >
              <BlockTitle marginY={gutters()}>
                {loadingAccountTemplates && <CircularProgress size={15} sx={{ marginRight: gutters() }} />}
                {t('templateLibrary.accountTemplates')}
              </BlockTitle>
            </ImportTemplatesDialogGallery>
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
          open={true}
          template={previewTemplate}
          onClose={handleClosePreview}
          actions={
            actionButton ? (
              cloneElement(actionButton(previewTemplate), {
                onClick: handleImportTemplate,
                loading: loadingImport,
              })
            ) : (
              <TemplateActionButton textKey="buttons.select" onClick={handleImportTemplate} loading={loadingImport} />
            )
          }
        />
      )}
      {onRemoveTemplate && (
        <ConfirmationDialog
          entities={{
            titleId: 'components.innovationFlowSettings.defaultTemplate.removeConfirmation.title',
            contentId: 'components.innovationFlowSettings.defaultTemplate.removeConfirmation.description',
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

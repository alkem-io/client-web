import { Button, CircularProgress, DialogActions, DialogContent, Link } from '@mui/material';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import React, { cloneElement, ReactElement, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImportTemplatesDialogGallery from './ImportTemplatesDialogGallery';
import { LibraryIcon } from '../../../LibraryIcon';
import { AnyTemplate } from '../../../models/TemplateBase';
import useLoadingState from '../../../../shared/utils/useLoadingState';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import { LoadingButtonProps } from '@mui/lab';
import { BlockTitle, Caption } from '../../../../../core/ui/typography';
import PreviewTemplateDialog from '../PreviewTemplateDialog/PreviewTemplateDialog';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import {
  useImportTemplateDialogPlatformTemplatesQuery,
  useImportTemplateDialogQuery,
  useSpaceTemplatesSetIdQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { gutters } from '../../../../../core/ui/grid/utils';
import SearchIcon from '@mui/icons-material/Search';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';

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
  actionButton: ReactElement<LoadingButtonProps>;
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
}: ImportTemplatesDialogProps) => {
  const { t } = useTranslation();
  const { spaceNameId } = useUrlParams();

  const canUseSpaceTemplates = !disableSpaceTemplates && !!spaceNameId;
  const [loadPlatformTemplates, setLoadPlatformTemplates] = useState(!canUseSpaceTemplates);

  const [previewTemplate, setPreviewTemplate] = useState<AnyTemplate>();
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

  const { data: templatesSetData } = useSpaceTemplatesSetIdQuery({
    variables: { spaceNameId: spaceNameId! },
    skip: !open || !canUseSpaceTemplates,
  });
  const templatesSetId = templatesSetData?.space.library?.id;

  const { data: templatesData, loading: loadingTemplates } = useImportTemplateDialogQuery({
    fetchPolicy: 'network-only',
    variables: {
      templatesSetId: templatesSetId!,
      includeCallout: templateType === TemplateType.Callout,
      includeInnovationFlow: templateType === TemplateType.InnovationFlow,
    },
    skip: !open || disableSpaceTemplates || !templatesSetId,
  });

  const templates = useMemo(() => {
    return templatesData?.lookup.templatesSet?.templates
      .filter(template => template.type === templateType)
      .map(template => ({ template, innovationPack: undefined }));
  }, [templatesData, templateType]);

  const { data: platformTemplatesData, loading: loadingPlatform } = useImportTemplateDialogPlatformTemplatesQuery({
    variables: {
      templateTypes: templateType ? [templateType] : undefined,
      includeCallout: templateType === TemplateType.Callout,
      includeInnovationFlow: templateType === TemplateType.InnovationFlow,
    },
    skip: !open || !loadPlatformTemplates,
  });
  const platformTemplates = platformTemplatesData?.platform.library.templates;

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
      <DialogWithGrid open={open} columns={12} onClose={handleClose}>
        <DialogHeader
          title={
            templateType
              ? t('pages.admin.generic.sections.templates.import.title', {
                  templateType: t(`common.enums.templateType.${templateType!}`),
                })
              : t('pages.admin.generic.sections.templates.import.defaultTitle')
          }
          onClose={handleClose}
          icon={<LibraryIcon />}
        />
        <DialogContent>
          {subtitle && <Caption marginBottom={gutters()}>{subtitle}</Caption>}
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
            <>
              <BlockTitle marginY={gutters()}>
                {loadingPlatform && <CircularProgress size={15} sx={{ marginRight: gutters() }} />}
                {t('templateLibrary.platformTemplates')}
              </BlockTitle>
              <ImportTemplatesDialogGallery
                templates={platformTemplates}
                onClickTemplate={template => setPreviewTemplate(template)}
                loading={loadingPlatform}
              />
            </>
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
          actions={cloneElement(actionButton, { onClick: handleImportTemplate, loading: loadingImport })}
        />
      )}
    </>
  );
};

export default ImportTemplatesDialog;

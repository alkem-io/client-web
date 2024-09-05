import { Button, DialogActions, DialogContent, Link } from '@mui/material';
import DialogWithGrid from '../../../../../../core/ui/dialog/DialogWithGrid';
import React, { cloneElement, ReactElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImportTemplatesDialogGallery from './ImportTemplatesDialogGallery';
import { LibraryIcon } from '../../../../LibraryIcon';
import { AnyTemplate } from '../../../models/TemplateBase';
import useLoadingState from '../../../../../shared/utils/useLoadingState';
import DialogHeader from '../../../../../../core/ui/dialog/DialogHeader';
import { LoadingButtonProps } from '@mui/lab';
import { BlockTitle, Caption } from '../../../../../../core/ui/typography';
import PreviewTemplateDialog from '../PreviewTemplateDialog/PreviewTemplateDialog';
import { TemplateType } from '../../../../../../core/apollo/generated/graphql-schema';
import {
  useImportTemplateDialogPlatformTemplatesQuery,
  useImportTemplateDialogQuery,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import { gutters } from '../../../../../../core/ui/grid/utils';
import SearchIcon from '@mui/icons-material/Search';

export interface ImportTemplatesOptions {
  /**
   * Filter templates by templateType
   */
  templateType?: TemplateType;

  /**
   * The origin of the templates, may be a space or an innovation pack, or the platform library
   * If not set only the platform library will be browsed
   */
  templatesSetId?: string;
  /**
   * Enables the option to search the entire platform library when templatesSetId is set,
   * first the templates from the templatesSetId will be shown and the user can click a link to load the platform templates
   */
  allowBrowsePlatformTemplates?: boolean;
}

interface ImportTemplatesDialogProps extends ImportTemplatesOptions {
  headerText: string;
  subtitle?: string;
  open: boolean;
  onClose?: () => void;
  onSelectTemplate: (template: AnyTemplate) => Promise<unknown>;
  actionButton: ReactElement<LoadingButtonProps>;
}

const ImportTemplatesDialog = ({
  headerText,
  subtitle,
  open,
  onClose,
  templatesSetId,
  allowBrowsePlatformTemplates,
  onSelectTemplate,
  actionButton,
  templateType,
}: ImportTemplatesDialogProps) => {
  const { t } = useTranslation();

  const loadTemplatesSetTemplates = !!templatesSetId;
  const [loadPlatformTemplates, setLoadPlatformTemplates] = useState(!loadTemplatesSetTemplates);

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

  const { data: templatesData, loading: loadingTemplates } = useImportTemplateDialogQuery({
    variables: {
      templatesSetId: templatesSetId!,
      includeCallout: templateType === TemplateType.Callout,
      includeInnovationFlow: templateType === TemplateType.InnovationFlow,
    },
    skip: !open || !templatesSetId,
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

  return (
    <>
      <DialogWithGrid open={open} columns={12} onClose={handleClose}>
        <DialogHeader title={headerText} onClose={handleClose} icon={<LibraryIcon />} />
        <DialogContent>
          {subtitle && <Caption marginBottom={gutters()}>{subtitle}</Caption>}
          {loadTemplatesSetTemplates && (
            <ImportTemplatesDialogGallery
              templates={templates}
              onClickTemplate={template => setPreviewTemplate(template)}
              loading={loadingTemplates}
            />
          )}
          {loadTemplatesSetTemplates && allowBrowsePlatformTemplates && !loadPlatformTemplates && (
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
              <BlockTitle marginY={gutters()}>{t('templateLibrary.platformTemplates')}</BlockTitle>
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

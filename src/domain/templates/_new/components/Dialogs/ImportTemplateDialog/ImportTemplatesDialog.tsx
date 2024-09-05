import { Button, DialogActions, DialogContent, DialogProps, Skeleton } from '@mui/material';
import DialogWithGrid from '../../../../../../core/ui/dialog/DialogWithGrid';
import React, { cloneElement, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImportTemplatesDialogGallery from './ImportTemplatesDialogGallery';
import { LibraryIcon } from '../../../../LibraryIcon';
import { AnyTemplate } from '../../../models/TemplateBase';
import useLoadingState from '../../../../../shared/utils/useLoadingState';
import DialogHeader from '../../../../../../core/ui/dialog/DialogHeader';
import { LoadingButtonProps } from '@mui/lab';
import { Caption } from '../../../../../../core/ui/typography';
import PreviewTemplateDialog from '../PreviewTemplateDialog/PreviewTemplateDialog';
import { TemplateType } from '../../../../../../core/apollo/generated/graphql-schema';
import { useImportTemplateDialogQuery } from '../../../../../../core/apollo/generated/apollo-hooks';

/*
//delete
<ImportTemplatesDialog
  {...dialogProps}
  headerText={importDialogHeaderText}
  dialogSubtitle={t('pages.admin.generic.sections.templates.import.subtitle')}
  templateImportCardComponent={TemplateImportCard}
  getImportedTemplateContent={getImportedWhiteboardTemplateContent}
  open={isImportTemplatesDialogOpen}
  onClose={closeImportTemplatesDialog}
  onImportTemplate={handleImportTemplate}
  innovationPacks={innovationPacks}
  loading={loadingInnovationPacks}
  actionButton={

  }
  templateType={templateType}
/>
*/
export interface ImportTemplatesDialogProps {
  headerText: string;
  subtitle?: string;
  open: boolean;
  onClose: DialogProps['onClose'];
  templateType: TemplateType | undefined;
  onImportTemplate: (template: AnyTemplate) => Promise<unknown>;
  actionButton: ReactElement<LoadingButtonProps>;
}

const ImportTemplatesDialog = ({
  headerText,
  subtitle,
  open,
  onClose,
  onImportTemplate,
  actionButton,
  templateType,
}: ImportTemplatesDialogProps) => {
  const { t } = useTranslation();
  const [previewTemplate, setPreviewTemplate] = useState<AnyTemplate>();
  const [handleImportTemplate, loadingImport] = useLoadingState(async () => {
    if (previewTemplate) {
      await onImportTemplate(previewTemplate);
    }
    handleClosePreview();
  });

  const handleClosePreview = () => {
    setPreviewTemplate(undefined);
  };

  const handleClose = () => {
    onClose?.({}, 'escapeKeyDown');
    handleClosePreview();
  };

  const { data, loading } = useImportTemplateDialogQuery({
    variables: { templateTypes: templateType ? [templateType] : undefined },
  });
  const templates = data?.platform.library.templates;


  if (!loading && previewTemplate) {
    return (
      <PreviewTemplateDialog
        template={previewTemplate}
        onClose={handleClosePreview}
        actions={cloneElement(actionButton, { onClick: handleImportTemplate, loading: loadingImport })}
      />
    );
  }

  return (
    <DialogWithGrid open={open} columns={12} onClose={handleClose}>
      <DialogHeader onClose={handleClose} icon={<LibraryIcon />}>
        {headerText}
        {subtitle && <Caption>{subtitle}</Caption>}
      </DialogHeader>
      <DialogContent>
        {loading && <Skeleton variant="rectangular" />}
        {!loading && (
          <ImportTemplatesDialogGallery
            templates={templates}
            onClickTemplate={(template) => setPreviewTemplate(template)}
            loading={loading}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('buttons.cancel')}</Button>
      </DialogActions>
    </DialogWithGrid>
  );
};

export default ImportTemplatesDialog;

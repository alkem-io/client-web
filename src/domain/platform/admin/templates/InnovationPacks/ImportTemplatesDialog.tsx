import { Button, ButtonProps, DialogContent, DialogProps, Skeleton } from '@mui/material';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import React, { cloneElement, ComponentType, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogActions } from '../../../../../core/ui/dialog/deprecated';
import { LibraryIcon } from '../../../../collaboration/templates/LibraryIcon';
import { Template } from '../AdminTemplatesSection';
import { InnovationPack } from './InnovationPack';
import ImportTemplatesDialogPreviewStep from './ImportTemplatesDialogPreviewStep';
import ImportTemplatesDialogGalleryStep, { TemplateImportCardComponentProps } from './ImportTemplatesDialogGalleryStep';
import { Identifiable } from '../../../../../core/utils/Identifiable';
import DialogTitleWithIcon from '../../../../../core/ui/dialog/DialogTitleWithIcon';
import { TemplateType } from '../../../../collaboration/InnovationPack/InnovationPackProfilePage/InnovationPackProfilePage';

export interface ImportTemplatesDialogProps<T extends Template, V extends T> {
  headerText: string;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps<T>>;
  getImportedTemplateContent?: (template: T) => void;
  importedTemplateContent?: V | undefined;
  innovationPacks: InnovationPack<T>[];
  open: boolean;
  onClose: DialogProps['onClose'];
  onImportTemplate: (template: T & Identifiable, templateValue?: V) => Promise<void>;
  loading?: boolean;
  dialogSubtitle: string;
  actionButton: ReactElement<ButtonProps>;
  templateType: TemplateType;
}

const ImportTemplatesDialog = <T extends Template, V extends T>({
  headerText,
  templateImportCardComponent,
  getImportedTemplateContent,
  importedTemplateContent,
  innovationPacks,
  loading,
  open,
  onClose,
  onImportTemplate,
  dialogSubtitle,
  actionButton,
  templateType,
}: ImportTemplatesDialogProps<T, V>) => {
  const { t } = useTranslation();
  const [previewTemplate, setPreviewTemplate] = useState<T & Identifiable>();

  const handleImportTemplate = async () => {
    previewTemplate && (await onImportTemplate?.(previewTemplate, importedTemplateContent));
    handleClosePreview();
  };

  const handlePreviewTemplate = (template: T & Identifiable) => {
    setPreviewTemplate(template);
  };

  const handleClosePreview = () => {
    setPreviewTemplate(undefined);
  };

  const handleClose = () => {
    onClose?.({}, 'escapeKeyDown');
    handleClosePreview();
  };

  if (!loading && previewTemplate) {
    return (
      <ImportTemplatesDialogPreviewStep
        template={previewTemplate}
        onClose={handleClosePreview}
        getImportedTemplateContent={getImportedTemplateContent}
        importedTemplateContent={importedTemplateContent}
        actions={cloneElement(actionButton, { onClick: handleImportTemplate })}
        templateType={templateType}
      />
    );
  }

  return (
    <DialogWithGrid open={open} columns={12} onClose={handleClose}>
      <DialogTitleWithIcon subtitle={dialogSubtitle} onClose={handleClose} icon={<LibraryIcon />}>
        {headerText}
      </DialogTitleWithIcon>
      <DialogContent>
        {loading && <Skeleton variant="rectangular" />}
        {!loading && (
          <ImportTemplatesDialogGalleryStep
            innovationPacks={innovationPacks}
            onPreviewTemplate={handlePreviewTemplate}
            templateImportCardComponent={templateImportCardComponent}
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

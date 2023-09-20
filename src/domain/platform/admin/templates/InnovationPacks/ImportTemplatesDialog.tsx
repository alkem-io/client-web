import { Button, ButtonProps, DialogContent, DialogProps, Skeleton } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React, { cloneElement, ComponentType, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogActions, DialogTitleWithIcon } from '../../../../../core/ui/dialog/deprecated';
import { LibraryIcon } from '../../../../collaboration/templates/LibraryIcon';
import { Template, TemplatePreviewProps, TemplateValue } from '../AdminTemplatesSection';
import { InnovationPack, TemplateInnovationPackMetaInfo } from './InnovationPack';
import ImportTemplatesDialogPreviewStep from './ImportTemplatesDialogPreviewStep';
import ImportTemplatesDialogGalleryStep, { TemplateImportCardComponentProps } from './ImportTemplatesDialogGalleryStep';

export interface ImportTemplatesDialogProps<
  T extends Template,
  Q extends T & TemplateInnovationPackMetaInfo,
  V extends TemplateValue
> {
  headerText: string;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps<Q>>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<T, V>>;
  getImportedTemplateContent?: (template: Q) => void;
  importedTemplateContent?: V | undefined;
  innovationPacks: InnovationPack<T>[];
  open: boolean;
  onClose: DialogProps['onClose'];
  onImportTemplate: (template: Q, templateValue?: V) => Promise<void>;
  loading?: boolean;
  dialogSubtitle: string;
  actionButton: ReactElement<ButtonProps>;
}

const ImportTemplatesDialog = <
  T extends Template,
  Q extends T & TemplateInnovationPackMetaInfo,
  V extends TemplateValue
>({
  headerText,
  templateImportCardComponent,
  templatePreviewComponent,
  getImportedTemplateContent,
  importedTemplateContent,
  innovationPacks,
  loading,
  open,
  onClose,
  onImportTemplate,
  dialogSubtitle,
  actionButton,
}: ImportTemplatesDialogProps<T, Q, V>) => {
  const { t } = useTranslation();
  const [previewTemplate, setPreviewTemplate] = useState<Q>();

  const handleImportTemplate = async () => {
    previewTemplate && (await onImportTemplate?.(previewTemplate, importedTemplateContent));
    handleClosePreview();
  };

  const handlePreviewTemplate = (template: Q) => {
    setPreviewTemplate(template);
  };

  const handleClosePreview = () => {
    setPreviewTemplate(undefined);
  };

  const handleClose = () => {
    onClose?.({}, 'escapeKeyDown');
    handleClosePreview();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', width: theme => theme.spacing(150) } }}
      maxWidth={false}
    >
      <DialogTitleWithIcon subtitle={dialogSubtitle} onClose={handleClose} icon={<LibraryIcon />}>
        {headerText}
      </DialogTitleWithIcon>
      <DialogContent>
        {loading && <Skeleton variant="rectangular" />}
        {!loading &&
          (!previewTemplate ? (
            <ImportTemplatesDialogGalleryStep
              innovationPacks={innovationPacks}
              onPreviewTemplate={handlePreviewTemplate}
              templateImportCardComponent={templateImportCardComponent}
              loading={loading}
            />
          ) : (
            <ImportTemplatesDialogPreviewStep
              template={previewTemplate}
              onClose={handleClosePreview}
              templatePreviewCardComponent={templateImportCardComponent}
              templatePreviewComponent={templatePreviewComponent}
              getImportedTemplateContent={getImportedTemplateContent}
              importedTemplateContent={importedTemplateContent}
              actions={cloneElement(actionButton, { onClick: handleImportTemplate })}
            />
          ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('buttons.cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportTemplatesDialog;

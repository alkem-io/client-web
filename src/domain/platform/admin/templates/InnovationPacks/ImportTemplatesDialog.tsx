import { Button, DialogContent, DialogProps, Skeleton } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React, { ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogActions } from '../../../../../common/components/core/dialog';
import DialogTitleWithIcon from '../../../../../common/components/core/dialog/DialogTitleWithIcon';
import { LibraryIcon } from '../../../../../common/icons/LibraryIcon';
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
  getImportedTemplateValue?: (template: T) => void;
  importedTemplateValue?: V | undefined;
  innovationPacks: InnovationPack<T>[];
  open: boolean;
  onClose: DialogProps['onClose'];
  onImportTemplate: (template: T, templateValue: V | undefined) => Promise<void>;
  loading?: boolean;
}

const ImportTemplatesDialog = <
  T extends Template,
  Q extends T & TemplateInnovationPackMetaInfo,
  V extends TemplateValue
>({
  headerText,
  templateImportCardComponent,
  templatePreviewComponent,
  getImportedTemplateValue,
  importedTemplateValue,
  innovationPacks,
  loading,
  open,
  onClose,
  onImportTemplate,
}: ImportTemplatesDialogProps<T, Q, V>) => {
  const { t } = useTranslation();

  const handleClose = () => {
    onClose?.({}, 'escapeKeyDown');
    handleClosePreview();
  };
  const [previewTemplate, setPreviewTemplate] = useState<Q>();

  const handleImportTemplate = async (template: T, templateValue: V | undefined) => {
    await onImportTemplate?.(template, templateValue);
    handleClosePreview();
  };

  const handlePreviewTemplate = (template: Q) => {
    setPreviewTemplate(template);
  };
  const handleClosePreview = () => {
    setPreviewTemplate(undefined);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', width: theme => theme.spacing(150) } }}
      maxWidth={false}
    >
      <DialogTitleWithIcon
        subtitle={t('pages.admin.generic.sections.templates.import.subtitle')}
        onClose={handleClose}
        icon={<LibraryIcon />}
      >
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
            />
          ) : (
            <ImportTemplatesDialogPreviewStep
              template={previewTemplate}
              onImportTemplate={handleImportTemplate}
              onClose={handleClosePreview}
              templatePreviewCardComponent={templateImportCardComponent}
              templatePreviewComponent={templatePreviewComponent}
              getImportedTemplateValue={getImportedTemplateValue}
              importedTemplateValue={importedTemplateValue}
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

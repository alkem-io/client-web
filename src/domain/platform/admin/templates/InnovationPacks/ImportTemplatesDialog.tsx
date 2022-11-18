import { Button, DialogContent, DialogProps, Skeleton } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React, { ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogActions } from '../../../../../common/components/core/dialog';
import DialogTitleWithIcon from '../../../../../common/components/core/dialog/DialogTitleWithIcon';
import { LibraryIcon } from '../../../../../common/icons/LibraryIcon';
import { Template, TemplatePreviewProps } from '../AdminTemplatesSection';
import { InnovationPack, TemplateFromInnovationPack } from './InnovationPack';
import ImportTemplatesDialogPreviewStep from './ImportTemplatesDialogPreviewStep';
import ImportTemplatesDialogGalleryStep, { TemplateImportCardComponentProps } from './ImportTemplatesDialogGalleryStep';

export interface ImportTemplatesDialogProps<T extends Template, Q extends T & TemplateFromInnovationPack> {
  headerText: string;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps<Q>>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<T>>;
  innovationPacks: InnovationPack[];
  open: boolean;
  onClose: DialogProps['onClose'];
  onImportTemplate: (template: T) => Promise<void>;
  loading?: boolean;
}

const ImportTemplatesDialog = <T extends Template, Q extends T & TemplateFromInnovationPack>({
  headerText,
  templateImportCardComponent,
  templatePreviewComponent,
  innovationPacks,
  loading,
  open,
  onClose,
  onImportTemplate,
}: ImportTemplatesDialogProps<T, Q>) => {
  const { t } = useTranslation();

  const handleClose = () => {
    if (onClose) {
      onClose({}, 'escapeKeyDown');
    }
    handleClosePreview();
  };
  const [previewTemplate, setPreviewTemplate] = useState<Q>();

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
              onImportTemplate={onImportTemplate}
              onPreviewTemplate={handlePreviewTemplate}
              templateImportCardComponent={templateImportCardComponent}
            />
          ) : (
            <ImportTemplatesDialogPreviewStep
              template={previewTemplate}
              onImportTemplate={onImportTemplate}
              onClose={handleClosePreview}
              templatePreviewCardComponent={templateImportCardComponent}
              templatePreviewComponent={templatePreviewComponent}
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

import { Button, DialogContent, DialogProps, Skeleton } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React, { ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DialogActions } from '../../../../../common/components/core/dialog';
import DialogTitleWithIcon from '../../../../../common/components/core/dialog/DialogTitleWithIcon';
import { LibraryIcon } from '../../../../../common/icons/LibraryIcon';
import { InnovationPack, InnovationPackTemplatesData, InnovationPackTemplateViewModel } from './InnovationPack';
import TemplatePreview from './TemplatePreview';
import TemplatesGallery, { TemplateImportCardComponentProps } from './TemplatesGallery';

export interface ImportTemplatesDialogProps {
  headerText: string;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps>;
  innovationPacks: InnovationPack[];
  open: boolean;
  onClose: DialogProps['onClose'];
  onSelectTemplate: (template: InnovationPackTemplatesData) => void;
  loading?: boolean;
}

const ImportTemplatesDialog = ({
  headerText,
  templateImportCardComponent,
  innovationPacks,
  loading,
  open,
  onClose,
  onSelectTemplate,
}: ImportTemplatesDialogProps) => {
  const { t } = useTranslation();

  // TODO: Rename to Innovat<I>onPack

  const handleClose = () => (onClose ? onClose({}, 'escapeKeyDown') : undefined);
  const [previewTemplate, setPreviewTemplate] = useState<InnovationPackTemplateViewModel>();

  const handlePreviewTemplate = (template: InnovationPackTemplateViewModel) => {
    setPreviewTemplate(template);
  };
  const handleClosePreview = () => {
    setPreviewTemplate(undefined);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', width: theme => theme.spacing(128) } }}
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
          (previewTemplate ? (
            <TemplatePreview
              template={previewTemplate}
              onSelectTemplate={onSelectTemplate}
              onClose={handleClosePreview}
            />
          ) : (
            <TemplatesGallery
              innovationPacks={innovationPacks}
              onSelectTemplate={onSelectTemplate}
              onPreviewTemplate={handlePreviewTemplate}
              templateImportCardComponent={templateImportCardComponent}
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

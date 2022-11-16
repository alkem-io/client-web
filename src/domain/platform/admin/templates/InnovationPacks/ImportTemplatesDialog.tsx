import { Button, DialogContent, DialogProps, Skeleton } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React, { ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogActions } from '../../../../../common/components/core/dialog';
import DialogTitleWithIcon from '../../../../../common/components/core/dialog/DialogTitleWithIcon';
import { LibraryIcon } from '../../../../../common/icons/LibraryIcon';
import { TemplateInfoFragment } from '../../../../../models/graphql-schema';
import { TemplatePreviewProps } from '../AdminTemplatesSection';
import { InnovationPack, InnovationPackTemplatesData, InnovationPackTemplateViewModel } from './InnovationPack';
import ImportTemplatesDialogTemplatePreview from './ImportTemplatesDialogTemplatePreview';
import ImportTemplatesDialogTemplatesGallery, {
  TemplateImportCardComponentProps,
} from './ImportTemplatesDialogTemplatesGallery';

export interface ImportTemplatesDialogProps {
  headerText: string;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<{ id: string; info: TemplateInfoFragment }>>;
  innovationPacks: InnovationPack[];
  open: boolean;
  onClose: DialogProps['onClose'];
  onSelectTemplate: (template: InnovationPackTemplatesData) => Promise<void>;
  loading?: boolean;
}

const ImportTemplatesDialog = ({
  headerText,
  templateImportCardComponent,
  templatePreviewComponent,
  innovationPacks,
  loading,
  open,
  onClose,
  onSelectTemplate,
}: ImportTemplatesDialogProps) => {
  const { t } = useTranslation();

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
          (previewTemplate ? (
            <ImportTemplatesDialogTemplatePreview
              template={previewTemplate}
              onSelectTemplate={onSelectTemplate}
              onClose={handleClosePreview}
              templatePreviewCardComponent={templateImportCardComponent}
              templatePreviewComponent={templatePreviewComponent}
            />
          ) : (
            <ImportTemplatesDialogTemplatesGallery
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

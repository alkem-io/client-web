import 'react-image-crop/dist/ReactCrop.css';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Dialog, FormControlLabel, Link } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import UploadButton from '../../../core/UploadButton';
import { DialogTitle, DialogActions, DialogContent } from '../../../core/dialog';
import { useConfig } from '../../../../../domain/platform/config/useConfig';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { useApolloErrorHandler } from '../../../../../core/apollo/hooks/useApolloErrorHandler';
import { useUploadFileMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { TranslateWithElements } from '../../../../../domain/shared/i18n/TranslateWithElements';
import SectionSpacer from '../../../../../domain/shared/components/Section/SectionSpacer';

interface FileUploadProps {
  onUpload?: (fileCID: string) => void;
}

const FileUploadButton: FC<FileUploadProps> = ({ onUpload }) => {
  const { t } = useTranslation();
  const tLinks = TranslateWithElements(<Link target="_blank" />);
  const { storage, platform } = useConfig();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();

  const [dialogOpened, setDialogOpened] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();

  const acceptedFileTypes = useMemo(() => storage?.file.mimeTypes.join(','), [storage]);
  const MB_LIMIT = storage?.file.maxFileSize ? storage.file.maxFileSize / (1024 * 1024) : 0;

  const [uploadFile, { loading }] = useUploadFileMutation({
    onError: handleError,
    onCompleted: data => {
      notify(t('components.file-upload.file-upload-success'), 'success');
      onUpload?.(data.uploadFile);
    },
  });

  const handleSubmit = async () => {
    if (!selectedFile) return;

    if (storage?.file.maxFileSize && selectedFile.size > storage?.file.maxFileSize) {
      notify(t('components.file-upload.file-size-error', { limit: MB_LIMIT }), 'error');
      return;
    }
    await uploadFile({ variables: { file: selectedFile } });
    handleClose();
  };

  const handleClose = () => {
    setConfirmation(false);
    setDialogOpened(false);
  };

  const handleCheckboxToggle = oldValue => {
    setConfirmation(!oldValue);
  };

  return (
    <>
      <UploadButton
        icon={<AttachFileIcon />}
        accept={acceptedFileTypes}
        onChange={e => {
          const file = e && e.target && e.target.files && e.target.files[0];
          if (file) {
            setSelectedFile(file);
            setDialogOpened(true);
          }
        }}
      />
      <Dialog open={dialogOpened} maxWidth="xs" aria-labelledby="confirm-innovation-flow">
        <DialogTitle id="confirm-innovation-flow">{t('components.file-upload.confirm-dialog.title')}</DialogTitle>
        <DialogContent sx={{ paddingX: 2 }}>
          {tLinks('components.file-upload.confirm-dialog.confirm-text', {
            aup: { href: platform?.aup },
          })}
          <SectionSpacer />
          <FormControlLabel
            control={<Checkbox checked={confirmation} onChange={() => handleCheckboxToggle(confirmation)} />}
            label={t('components.file-upload.confirm-dialog.checkbox-label')}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'end' }}>
          {handleClose && <Button onClick={handleClose}>{t('buttons.cancel')}</Button>}
          <Button onClick={handleSubmit} disabled={loading || !confirmation}>
            {t('buttons.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileUploadButton;

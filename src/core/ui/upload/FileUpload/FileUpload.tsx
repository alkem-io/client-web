import 'react-image-crop/dist/ReactCrop.css';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Dialog, DialogContent, FormControlLabel, Link } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import UploadButton from '../../../../common/components/core/UploadButton';
import { useConfig } from '../../../../domain/platform/config/useConfig';
import { useNotification } from '../../notifications/useNotification';
import { useUploadFileMutation } from '../../../apollo/generated/apollo-hooks';
import { TranslateWithElements } from '../../../../domain/shared/i18n/TranslateWithElements';
import { Actions } from '../../actions/Actions';
import DialogHeader from '../../dialog/DialogHeader';
import { BlockTitle } from '../../typography';
import { gutters } from '../../grid/utils';
import { StorageConfig } from '../../../../domain/platform/storage/StorageBucket/useStorageConfig';

interface FileUploadProps {
  onUpload?: (fileCID: string) => void;
  referenceID: string;
  storageConfig: StorageConfig;
}

const FileUploadButton: FC<FileUploadProps> = ({ onUpload, referenceID, storageConfig }) => {
  const { t } = useTranslation();
  const tLinks = TranslateWithElements(<Link target="_blank" />);
  const { platform } = useConfig();
  const notify = useNotification();

  const [dialogOpened, setDialogOpened] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();

  const acceptedFileTypes = storageConfig.allowedMimeTypes.join(',');
  const MB_LIMIT = storageConfig.maxFileSize ? storageConfig.maxFileSize / (1024 * 1024) : 0;

  const [uploadFile, { loading }] = useUploadFileMutation({
    onCompleted: data => {
      notify(t('components.file-upload.file-upload-success'), 'success');
      onUpload?.(data.uploadFileOnReference.uri);
    },
  });

  const handleSubmit = async () => {
    if (!selectedFile) return;

    if (storageConfig.maxFileSize && selectedFile.size > storageConfig.maxFileSize) {
      notify(t('components.file-upload.file-size-error', { limit: MB_LIMIT }), 'error');
      return;
    }

    await uploadFile({
      variables: {
        file: selectedFile,
        uploadData: {
          referenceID,
        },
      },
    });
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
      <Dialog open={dialogOpened} maxWidth="xs" aria-labelledby="confirm-file-upload">
        <DialogHeader onClose={handleClose}>
          <BlockTitle>{t('components.file-upload.confirm-dialog.title')}</BlockTitle>
        </DialogHeader>
        <DialogContent sx={{ paddingX: 2 }}>
          {tLinks('components.file-upload.confirm-dialog.confirm-text', {
            aup: { href: platform?.aup },
          })}
          <FormControlLabel
            sx={{ marginTop: gutters() }}
            control={<Checkbox checked={confirmation} onChange={() => handleCheckboxToggle(confirmation)} />}
            label={t('components.file-upload.confirm-dialog.checkbox-label')}
          />
        </DialogContent>
        <Actions padding={gutters()} justifyContent="end">
          {handleClose && <Button onClick={handleClose}>{t('buttons.cancel')}</Button>}
          <Button variant="contained" onClick={handleSubmit} disabled={loading || !confirmation}>
            {t('buttons.confirm')}
          </Button>
        </Actions>
      </Dialog>
    </>
  );
};

export default FileUploadButton;

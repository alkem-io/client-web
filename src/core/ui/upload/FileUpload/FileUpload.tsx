import AttachFileIcon from '@mui/icons-material/AttachFile';
import { CircularProgress } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-image-crop/dist/ReactCrop.css';
import UploadButton from '../../../../common/components/core/UploadButton';
import { StorageConfig } from '../../../../domain/platform/storage/StorageBucket/useStorageConfig';
import { useUploadFileMutation } from '../../../apollo/generated/apollo-hooks';
import { useNotification } from '../../notifications/useNotification';

interface FileUploadProps {
  onUpload?: (fileCID: string) => void;
  referenceID: string;
  storageConfig: StorageConfig;
}

const bytesInMegabyte = Math.pow(1024, 2);

const FileUploadButton: FC<FileUploadProps> = ({ onUpload, referenceID, storageConfig }) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const acceptedFileTypes = storageConfig.allowedMimeTypes.join(',');
  const maxFileSizeMb = storageConfig.maxFileSize ? storageConfig.maxFileSize / bytesInMegabyte : 0;

  const [uploadFile, { loading }] = useUploadFileMutation({
    onCompleted: data => {
      notify(t('components.file-upload.file-upload-success'), 'success');
      onUpload?.(data.uploadFileOnReference.uri);
    },
  });

  const handleSubmit = async (selectedFile: File) => {
    if (!selectedFile) return;

    if (storageConfig.maxFileSize && selectedFile.size > storageConfig.maxFileSize) {
      notify(t('components.file-upload.file-size-error', { limit: maxFileSizeMb }), 'error');
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
  };
  /*
  //TODO: Add the message

  const tLinks = TranslateWithElements(<Link target="_blank" />);
  const { platform } = useConfig();
  {
    tLinks('components.file-upload.confirm-dialog.confirm-text', {
      aup: { href: platform?.aup },
    });
  }
  */
  return (
    <UploadButton
      icon={loading ? <CircularProgress size={20} /> : <AttachFileIcon />}
      disabled={loading}
      accept={acceptedFileTypes}
      onChange={e => {
        const file = e && e.target && e.target.files && e.target.files[0];
        if (file) {
          handleSubmit(file);
        }
      }}
    />
  );
};

export default FileUploadButton;

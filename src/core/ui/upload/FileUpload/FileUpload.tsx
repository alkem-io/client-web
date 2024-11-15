import AttachFileIcon from '@mui/icons-material/AttachFile';
import { CircularProgress } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-image-crop/dist/ReactCrop.css';
import UploadButton from '../../button/UploadButton';
import { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import {
  useUploadFileMutation,
  useUploadFileOnLinkMutation,
  useUploadFileOnReferenceMutation,
} from '../../../apollo/generated/apollo-hooks';
import { useNotification } from '../../notifications/useNotification';

const DEFAULT_REFERENCE_TYPE = 'reference';

export type FileUploadEntityType = 'reference' | 'link';

interface FileUploadProps {
  onUpload?: (fileCID: string) => void;
  onChange?: (fileName: string) => void;
  entityID?: string;
  entityType?: FileUploadEntityType;
  storageConfig: StorageConfig;
}

const bytesInMegabyte = Math.pow(1024, 2);

const FileUploadButton: FC<FileUploadProps> = ({
  onUpload,
  onChange,
  entityID,
  entityType = DEFAULT_REFERENCE_TYPE,
  storageConfig,
}) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const acceptedFileTypes = storageConfig.allowedMimeTypes.join(',');
  const maxFileSizeMb = storageConfig.maxFileSize ? storageConfig.maxFileSize / bytesInMegabyte : 0;

  const [uploadFileOnReference, { loading: loadingOnReference }] = useUploadFileOnReferenceMutation({
    onCompleted: data => {
      notify(t('components.file-upload.file-upload-success'), 'success');
      onUpload?.(data.uploadFileOnReference.uri);
    },
  });
  const [uploadFileOnLink, { loading: loadingOnLink }] = useUploadFileOnLinkMutation({
    onCompleted: data => {
      notify(t('components.file-upload.file-upload-success'), 'success');
      onUpload?.(data.uploadFileOnLink.uri);
    },
  });

  const [uploadFile, { loading: loadingOnStorageBucket }] = useUploadFileMutation({
    onCompleted: data => {
      notify(t('components.file-upload.file-upload-success'), 'success');
      onUpload?.(data.uploadFileOnStorageBucket);
    },
  });
  const loading = loadingOnReference || loadingOnLink || loadingOnStorageBucket;

  const handleSubmit = async (selectedFile: File) => {
    if (!selectedFile) return;

    if (storageConfig.maxFileSize && selectedFile.size > storageConfig.maxFileSize) {
      notify(t('components.file-upload.file-size-error', { limit: maxFileSizeMb }), 'error');
      return;
    }
    if (entityID && entityType === 'reference') {
      await uploadFileOnReference({
        variables: {
          file: selectedFile,
          uploadData: {
            referenceID: entityID,
          },
        },
      });
      return;
    }
    if (entityID && entityType === 'link') {
      await uploadFileOnLink({
        variables: {
          file: selectedFile,
          uploadData: {
            linkID: entityID,
          },
        },
      });
      return;
    }

    await uploadFile({
      variables: {
        file: selectedFile,
        uploadData: {
          storageBucketId: storageConfig.storageBucketId,
          temporaryLocation: storageConfig.temporaryLocation,
        },
      },
    });
  };

  return (
    <UploadButton
      icon={loading ? <CircularProgress size={20} /> : <AttachFileIcon />}
      disabled={loading}
      accept={acceptedFileTypes}
      onChange={e => {
        const file = e && e.target && e.target.files && e.target.files[0];
        if (file) {
          handleSubmit(file);
          onChange?.(file.name);
        }
      }}
    />
  );
};

export default FileUploadButton;

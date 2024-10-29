import { useTranslation } from 'react-i18next';
import { CircularProgress } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';

import 'react-image-crop/dist/ReactCrop.css';
import {
  useUploadFileMutation,
  useUploadFileOnLinkMutation,
  useUploadFileOnReferenceMutation,
} from '../../../apollo/generated/apollo-hooks';
import UploadButton from '../../button/UploadButton';
import { useNotification } from '../../notifications/useNotification';
import { StorageConfig } from '../../../../domain/storage/StorageBucket/useStorageConfig';

const bytesInMegabyte = Math.pow(1024, 2);
const DEFAULT_REFERENCE_TYPE = 'reference';

const FileUploadButton = ({
  entityID,
  storageConfig,
  entityType = DEFAULT_REFERENCE_TYPE,
  onChange,
  onUpload,
}: FileUploadProps) => {
  const { t } = useTranslation();

  const notify = useNotification();

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

  const handleSubmit = async (selectedFile: File) => {
    if (!selectedFile) {
      return;
    }

    const maxFileSizeMb = storageConfig.maxFileSize ? storageConfig.maxFileSize / bytesInMegabyte : 0;
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

  const acceptedFileTypes = storageConfig.allowedMimeTypes.join(',');
  const loading = loadingOnReference || loadingOnLink || loadingOnStorageBucket;

  return (
    <UploadButton
      disabled={loading}
      accept={acceptedFileTypes}
      icon={loading ? <CircularProgress size={20} /> : <AttachFileIcon />}
      onChange={e => {
        const file = e?.target?.files?.[0];

        if (file) {
          handleSubmit(file);
          onChange?.(file.name);
        }
      }}
    />
  );
};

export default FileUploadButton;

export type FileUploadEntityType = 'reference' | 'link';

interface FileUploadProps {
  storageConfig: StorageConfig;
  entityID?: string;
  entityType?: FileUploadEntityType;
  onUpload?: (fileCID: string) => void;
  onChange?: (fileName: string) => void;
}

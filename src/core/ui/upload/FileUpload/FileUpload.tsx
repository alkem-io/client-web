import AttachFileIcon from '@mui/icons-material/AttachFile';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import 'react-image-crop/dist/ReactCrop.css';
import { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import {
  useUploadFileMutation,
  useUploadFileOnLinkMutation,
  useUploadFileOnReferenceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import UploadButton from '@/core/ui/button/UploadButton';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useMemo } from 'react';

const DEFAULT_REFERENCE_TYPE = 'reference';

export type FileUploadEntityType = 'reference' | 'link';

export interface UploadedDocument {
  id: string;
  url: string;
}

type FileUploadProps = {
  onUpload?: (url: string) => void;
  onDocumentUploaded?: (document: UploadedDocument) => void;
  onChange?: (fileName: string) => void;
  entityID?: string;
  entityType?: FileUploadEntityType;
  storageConfig: StorageConfig;
};

const bytesInMegabyte = Math.pow(1024, 2);

const FileUploadButton = ({
  onUpload,
  onDocumentUploaded,
  onChange,
  entityID,
  entityType = DEFAULT_REFERENCE_TYPE,
  storageConfig,
}: FileUploadProps) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const maxFileSizeMb = storageConfig.maxFileSize ? storageConfig.maxFileSize / bytesInMegabyte : 0;

  // NOTE: Some browsers fail to map mime types to extensions correctly. Hence the need of a mapping of
  // file types to extensions explicitly, so we can have a filtered list when selecting files on the client.
  // Extended mimeTypeToExtensionMap
  const mimeTypeToExtensionMap: { [mimeType: string]: string } = {
    // PDF
    'application/pdf': '.pdf',

    // Excel
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.oasis.opendocument.spreadsheet': '.ods',

    // Word
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.oasis.opendocument.text': '.odt',

    // Images
    'image/bmp': '.bmp',
    'image/jpg': '.jpg',
    'image/jpeg': '.jpg,.jpeg',
    'image/x-png': '.png',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',

    // PowerPoint
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/vnd.ms-powerpoint.presentation.macroEnabled.12': '.pptm',
    'application/vnd.openxmlformats-officedocument.presentationml.slideshow': '.ppsx',
    'application/vnd.ms-powerpoint.slideshow.macroEnabled.12': '.ppsm',
    'application/vnd.openxmlformats-officedocument.presentationml.template': '.potx',
    'application/vnd.ms-powerpoint.template.macroEnabled.12': '.potm',
    'application/vnd.oasis.opendocument.presentation': '.odp',
  } as const;

  const allowedMimeTypes = storageConfig.allowedMimeTypes;

  const allowedExtensions = useMemo(() => {
    return allowedMimeTypes
      .map(mimeType => mimeTypeToExtensionMap[mimeType])
      .filter(Boolean)
      .join(',');
  }, [allowedMimeTypes]);

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
      const { id, url } = data.uploadFileOnStorageBucket;
      onUpload?.(url);
      onDocumentUploaded?.({ id, url });
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
      allowedTypes={allowedExtensions.split(',')}
      onFileSelected={file => {
        handleSubmit(file);
        onChange?.(file.name);
      }}
    />
  );
};

export default FileUploadButton;

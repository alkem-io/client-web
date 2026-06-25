import { Loader2, Paperclip } from 'lucide-react';
import { type ChangeEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { Button } from '@/crd/primitives/button';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';

const BYTES_IN_MB = 1024 ** 2;

// Mirror of the map in src/core/ui/upload/FileUpload/FileUpload.tsx — some browsers fail to map
// mime types to extensions on the file picker, so we resolve them explicitly here.
const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.oasis.opendocument.spreadsheet': '.ods',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.oasis.opendocument.text': '.odt',
  'text/calendar': '.ics',
  'image/bmp': '.bmp',
  'image/jpg': '.jpg',
  'image/jpeg': '.jpg,.jpeg',
  'image/x-png': '.png',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.ms-powerpoint.presentation.macroEnabled.12': '.pptm',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow': '.ppsx',
  'application/vnd.ms-powerpoint.slideshow.macroEnabled.12': '.ppsm',
  'application/vnd.openxmlformats-officedocument.presentationml.template': '.potx',
  'application/vnd.ms-powerpoint.template.macroEnabled.12': '.potm',
  'application/vnd.oasis.opendocument.presentation': '.odp',
};

type LinkUrlAttachFileButtonProps = {
  storageConfig: StorageConfig | undefined;
  disabled?: boolean;
  onUploaded: (params: { url: string; documentId: string; fileName: string }) => void;
};

export function LinkUrlAttachFileButton({ storageConfig, disabled, onUploaded }: LinkUrlAttachFileButtonProps) {
  const { t } = useTranslation();
  const notify = useNotification();
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploadFile, { loading }] = useUploadFileMutation({
    onCompleted: data => {
      const { id, url } = data.uploadFileOnStorageBucket;
      const fileName = inputRef.current?.files?.[0]?.name ?? '';
      notify(t('components.file-upload.file-upload-success'), 'success');
      onUploaded({ url, documentId: id, fileName });
      if (inputRef.current) inputRef.current.value = '';
    },
  });

  const canUpload = Boolean(storageConfig?.canUpload);
  const accept = (storageConfig?.allowedMimeTypes ?? [])
    .map(mime => MIME_TO_EXT[mime])
    .filter(Boolean)
    .join(',');
  const maxBytes = storageConfig?.maxFileSize ?? 0;
  const maxMb = maxBytes ? maxBytes / BYTES_IN_MB : 0;

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !storageConfig) return;
    if (maxBytes && file.size > maxBytes) {
      notify(t('components.file-upload.file-size-error', { limit: maxMb }), 'error');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    await uploadFile({
      variables: {
        file,
        uploadData: {
          storageBucketId: storageConfig.storageBucketId,
          temporaryLocation: true,
        },
      },
    });
  };

  if (!canUpload) return null;

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFileSelected} />
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={disabled || loading}
        aria-busy={loading}
        aria-label={t('components.file-upload.uploadFile')}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Paperclip className="size-4" aria-hidden="true" />
        )}
      </Button>
    </>
  );
}

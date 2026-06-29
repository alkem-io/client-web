import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import type { ComposerAttachment } from '@/crd/components/comment/types';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import { type AttachmentRejection, MAX_ATTACHMENT_SIZE_BYTES, validateAttachments } from './validateAttachments';

type StagedAttachment = ComposerAttachment & {
  /** Set once the upload resolves — the file-service document id sent to the room. */
  documentId?: string;
};

export type UseConversationAttachmentsResult = {
  /** Whether the composer should show the attach affordance (a writable bucket
   *  is available). */
  enabled: boolean;
  /** Staged attachments for the composer chips. */
  attachments: ComposerAttachment[];
  /** Ready document ids to pass to the send mutation. */
  documentIds: string[];
  /** A localized validation / upload error, or undefined. */
  error?: string;
  /** Whether any upload is still in flight. */
  uploading: boolean;
  /** File picker `accept` attribute derived from the bucket policy. */
  accept?: string;
  attachFiles: (files: File[]) => Promise<void>;
  removeAttachment: (id: string) => void;
  /** Clears all staged attachments + error (call after a successful send). */
  reset: () => void;
};

/**
 * Owns the upload lifecycle for conversation message attachments (feature 013).
 * On attach it validates against the conversation bucket policy (count / size /
 * type — FR-020/022/023), then uploads each accepted file via
 * `uploadFileOnStorageBucket` with `temporaryLocation: true` (the document is
 * swept if the draft is never sent — FR-012), collecting the resulting document
 * ids for the send mutation.
 *
 * Requires the conversation's storage bucket config; until the server exposes a
 * conversation storage bucket via GraphQL (see `useConversationStorageConfig`),
 * `storageConfig` is undefined and the hook reports `enabled: false`, so the
 * composer renders exactly as before.
 */
export function useConversationAttachments(storageConfig: StorageConfig | undefined): UseConversationAttachmentsResult {
  const { t } = useTranslation('crd-space');
  const [uploadFile] = useUploadFileMutation();
  const [attachments, setAttachments] = useState<StagedAttachment[]>([]);
  const [error, setError] = useState<string | undefined>();

  const enabled = Boolean(storageConfig?.canUpload);

  const describeRejection = (rejection: AttachmentRejection): string => {
    switch (rejection.reason) {
      case 'tooMany':
        return t('comments.attachments.errorTooMany', { max: 10 });
      case 'tooLarge':
        return t('comments.attachments.errorTooLarge', {
          name: rejection.fileName,
          max: Math.floor((storageConfig?.maxFileSize || MAX_ATTACHMENT_SIZE_BYTES) / (1024 * 1024)),
        });
      default:
        return t('comments.attachments.errorUnsupportedType', { name: rejection.fileName });
    }
  };

  const attachFiles = async (files: File[]): Promise<void> => {
    setError(undefined);
    if (!storageConfig) return;

    const { accepted, rejected } = validateAttachments(files, {
      existingCount: attachments.length,
      allowedMimeTypes: storageConfig.allowedMimeTypes?.length ? storageConfig.allowedMimeTypes : undefined,
      maxFileSizeBytes: storageConfig.maxFileSize || undefined,
    });

    if (rejected.length > 0) {
      setError(describeRejection(rejected[0]));
    }

    for (const file of accepted) {
      const stagedId = `${file.name}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
      setAttachments(prev => [...prev, { id: stagedId, name: file.name, status: 'uploading', mimeType: file.type }]);

      try {
        const { data } = await uploadFile({
          variables: {
            file,
            uploadData: { storageBucketId: storageConfig.storageBucketId, temporaryLocation: true },
          },
        });
        const documentId = data?.uploadFileOnStorageBucket.id;
        if (!documentId) {
          throw new Error('Upload returned no document id');
        }
        setAttachments(prev =>
          prev.map(attachment =>
            attachment.id === stagedId ? { ...attachment, status: 'ready', documentId } : attachment
          )
        );
      } catch {
        setAttachments(prev =>
          prev.map(attachment => (attachment.id === stagedId ? { ...attachment, status: 'error' } : attachment))
        );
        setError(t('comments.attachments.uploadFailed'));
      }
    }
  };

  const removeAttachment = (id: string): void => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  const reset = (): void => {
    setAttachments([]);
    setError(undefined);
  };

  const accept = storageConfig?.allowedMimeTypes?.length ? storageConfig.allowedMimeTypes.join(',') : undefined;

  return {
    enabled,
    attachments: attachments.map(({ id, name, status, mimeType }) => ({ id, name, status, mimeType })),
    documentIds: attachments
      .filter(attachment => attachment.status === 'ready' && attachment.documentId)
      .map(attachment => attachment.documentId as string),
    error,
    uploading: attachments.some(attachment => attachment.status === 'uploading'),
    accept,
    attachFiles,
    removeAttachment,
    reset,
  };
}

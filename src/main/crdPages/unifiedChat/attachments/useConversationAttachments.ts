import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUploadFileMutation } from '@/core/apollo/generated/apollo-hooks';
import type { ComposerAttachment } from '@/crd/components/comment/types';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import { MIME_TO_EXT } from '@/main/crdPages/utils/mimeToExt';
import {
  type AttachmentRejection,
  DEFAULT_ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  validateAttachments,
} from './validateAttachments';

type SelectedFile = ComposerAttachment & { file: File; documentId?: string };
export type SendEvent = (text: string, documentIds?: string[]) => Promise<boolean | undefined>;

/** Owned by one keyed composer instance. Selection is local; Send uploads each file. */
export function useConversationAttachments(storageConfig: StorageConfig | undefined) {
  const { t } = useTranslation('crd-space');
  const [uploadFile] = useUploadFileMutation();
  const [draft, setDraft] = useState<{ items: SelectedFile[]; error?: string }>({ items: [] });
  const [isSending, setIsSending] = useState(false);
  const lifetime = useRef({ disposed: false, busy: false });
  useLayoutEffect(() => {
    const current = { disposed: false, busy: false };
    lifetime.current = current;
    return () => {
      current.disposed = true;
    };
  }, []);

  const enabled = Boolean(storageConfig?.canUpload);
  const allowedMimeTypes = storageConfig?.allowedMimeTypes?.length
    ? storageConfig.allowedMimeTypes
    : DEFAULT_ALLOWED_ATTACHMENT_MIME_TYPES;
  const accept = storageConfig
    ? allowedMimeTypes.flatMap(mime => (MIME_TO_EXT[mime] ? [mime, MIME_TO_EXT[mime]] : [mime])).join(',')
    : undefined;

  const describeRejection = (rejection: AttachmentRejection) => {
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

  const attachFiles = (files: File[]) => {
    if (!enabled || lifetime.current.busy || lifetime.current.disposed) return;
    const selected = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      mimeType: file.type,
      status: 'ready' as const,
      file,
    }));
    setDraft(previous => {
      const { accepted, rejected } = validateAttachments(files, {
        existingCount: previous.items.length,
        allowedMimeTypes,
        maxFileSizeBytes: storageConfig?.maxFileSize || undefined,
      });
      return {
        items: [...previous.items, ...selected.filter(item => accepted.includes(item.file))],
        error: rejected.length ? describeRejection(rejected[0]) : undefined,
      };
    });
  };

  const removeAttachment = (id: string) => {
    if (lifetime.current.busy || lifetime.current.disposed) return;
    setDraft(previous => ({ items: previous.items.filter(item => item.id !== id) }));
  };

  const send = async (text: string, sendEvent: SendEvent, textSent: () => void): Promise<boolean> => {
    const current = lifetime.current;
    if (current.busy || current.disposed || (draft.items.length > 0 && !enabled)) return false;
    current.busy = true;
    setIsSending(true);
    setDraft(previous => ({ ...previous, error: undefined }));
    let activeFile: SelectedFile | undefined;
    let uploading = false;
    try {
      if (text.trim()) {
        if (!(await sendEvent(text))) throw new Error('send unconfirmed');
        if (current.disposed) return false;
        textSent();
      }
      for (const item of draft.items) {
        if (current.disposed) return false;
        activeFile = item;
        let documentId = item.documentId;
        if (!documentId) {
          if (!storageConfig) return false;
          uploading = true;
          setDraft(previous => ({
            ...previous,
            items: previous.items.map(value => (value.id === item.id ? { ...value, status: 'uploading' } : value)),
          }));
          const { data } = await uploadFile({
            variables: {
              file: item.file,
              uploadData: { storageBucketId: storageConfig.storageBucketId, temporaryLocation: false },
            },
          });
          if (current.disposed) return false;
          documentId = data?.uploadFileOnStorageBucket.id;
          if (!documentId) throw new Error('Upload returned no document id');
          uploading = false;
          setDraft(previous => ({
            ...previous,
            items: previous.items.map(value =>
              value.id === item.id ? { ...value, status: 'ready', documentId } : value
            ),
          }));
        }
        if (!(await sendEvent('', [documentId]))) throw new Error('send unconfirmed');
        if (current.disposed) return false;
        setDraft(previous => ({ ...previous, items: previous.items.filter(value => value.id !== item.id) }));
      }
      return true;
    } catch {
      if (!current.disposed)
        setDraft(previous => ({
          items: previous.items.map(value => (value.id === activeFile?.id ? { ...value, status: 'error' } : value)),
          error: t(uploading ? 'comments.attachments.uploadFailed' : 'comments.attachments.sendUnconfirmed'),
        }));
      return false;
    } finally {
      current.busy = false;
      if (!current.disposed) setIsSending(false);
    }
  };

  return {
    enabled,
    attachments: draft.items,
    error: draft.error,
    accept,
    isSending,
    attachFiles,
    removeAttachment,
    send,
  };
}

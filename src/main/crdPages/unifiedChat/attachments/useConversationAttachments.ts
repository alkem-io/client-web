import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { RoomMessageAttachmentInput } from '@/core/apollo/generated/graphql-schema';
import type { ComposerAttachment } from '@/crd/components/comment/types';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import { MIME_TO_EXT } from '@/main/crdPages/utils/mimeToExt';
import {
  type AttachmentRejection,
  DEFAULT_ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_ATTACHMENTS_PER_MESSAGE,
  validateAttachments,
} from './validateAttachments';

type UploadLifetime = { disposed: boolean; busy: boolean; contextKey: string; upload?: AbortController };

type SelectedFile = ComposerAttachment & { file: File; uploadedAttachment?: RoomMessageAttachmentInput };
export type AttachmentContext = { roomID: string; threadID?: string };
export type SendEvent = (text: string, attachmentUpload?: RoomMessageAttachmentInput) => Promise<boolean | undefined>;
/**
 * Optional per-composer behaviour. Omitting both keeps the chat defaults: up to
 * MAX_ATTACHMENTS_PER_MESSAGE files, and the text is sent before the files.
 * - maxAttachments: how many files one send may carry.
 * - textLast: send the files first (in reverse staged order) and the text last,
 *   for threads shown newest first, so the text ends up above its files. The text
 *   is only sent once every file is posted, so a failed file never loses it.
 */
export type AttachmentOptions = { maxAttachments?: number; textLast?: boolean };

/** Owned by one keyed composer instance. Selection is local; Send uploads each file. */
export function useConversationAttachments(
  storageConfig: StorageConfig | undefined,
  context: AttachmentContext | undefined,
  options: AttachmentOptions = {}
) {
  const { t } = useTranslation('crd-space');
  const [draft, setDraft] = useState<{ items: SelectedFile[]; error?: string }>({ items: [] });
  const [isSending, setIsSending] = useState(false);
  const contextKey = JSON.stringify([context?.roomID, context?.threadID ?? null]);
  const lifetime = useRef<UploadLifetime>({ disposed: false, busy: false, contextKey });
  useLayoutEffect(() => {
    const previous = lifetime.current;
    const current: UploadLifetime = { disposed: false, busy: false, contextKey };
    lifetime.current = current;
    if (previous.contextKey !== contextKey) {
      setDraft({ items: [] });
      setIsSending(false);
    }
    return () => {
      current.disposed = true;
      current.upload?.abort();
    };
  }, [contextKey]);

  const maxAttachments = options.maxAttachments ?? MAX_ATTACHMENTS_PER_MESSAGE;
  const enabled = Boolean(storageConfig?.canUpload && context?.roomID);
  const allowedMimeTypes = storageConfig?.allowedMimeTypes ?? DEFAULT_ALLOWED_ATTACHMENT_MIME_TYPES;
  const accept = storageConfig
    ? allowedMimeTypes.flatMap(mime => (MIME_TO_EXT[mime] ? [mime, MIME_TO_EXT[mime]] : [mime])).join(',')
    : undefined;

  const describeRejection = (rejection: AttachmentRejection) => {
    switch (rejection.reason) {
      case 'tooMany':
        return t('comments.attachments.errorTooMany', { count: maxAttachments });
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
        maxAttachments,
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
    // Only called when there is text, so an image-only send starts its first
    // upload synchronously, with no extra await in front of it.
    const hasText = Boolean(text.trim());
    const sendText = async (): Promise<boolean> => {
      activeFile = undefined;
      if (!(await sendEvent(text))) throw new Error('send unconfirmed');
      textSent();
      return !current.disposed;
    };
    const items = options.textLast ? [...draft.items].reverse() : draft.items;
    try {
      if (hasText && !options.textLast && !(await sendText())) return false;
      for (const item of items) {
        if (current.disposed) return false;
        activeFile = item;
        let uploadedAttachment = item.uploadedAttachment;
        if (!uploadedAttachment) {
          if (!context) return false;
          uploading = true;
          setDraft(previous => ({
            ...previous,
            items: previous.items.map(value => (value.id === item.id ? { ...value, status: 'uploading' } : value)),
          }));
          const controller = new AbortController();
          current.upload = controller;
          let upload: { mediaId?: unknown };
          try {
            const response = await fetch(
              `/api/private/rest/messaging/media/upload?filename=${encodeURIComponent(item.file.name)}`,
              {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': item.file.type || 'application/octet-stream' },
                body: item.file,
                signal: controller.signal,
              }
            );
            if (!response.ok) throw new Error('Media upload failed');
            upload = await response.json();
          } finally {
            current.upload = undefined;
          }
          if (current.disposed) return false;
          if (typeof upload.mediaId !== 'string' || !upload.mediaId)
            throw new Error('Upload returned no media reference');
          uploadedAttachment = { externalReference: upload.mediaId, displayName: item.file.name };
          uploading = false;
          setDraft(previous => ({
            ...previous,
            items: previous.items.map(value =>
              value.id === item.id ? { ...value, status: 'ready', uploadedAttachment } : value
            ),
          }));
        }
        if (!(await sendEvent('', uploadedAttachment))) throw new Error('send unconfirmed');
        if (current.disposed) return false;
        setDraft(previous => ({ ...previous, items: previous.items.filter(value => value.id !== item.id) }));
      }
      if (hasText && options.textLast && !(await sendText())) return false;
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

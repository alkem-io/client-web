import { useLayoutEffect, useRef, useState } from 'react';
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
export function useConversationAttachments(
  storageConfig: StorageConfig | undefined,
  conversationId?: string
): UseConversationAttachmentsResult {
  const { t } = useTranslation('crd-space');
  const [uploadFile] = useUploadFileMutation();
  const [attachments, setAttachments] = useState<StagedAttachment[]>([]);
  const [error, setError] = useState<string | undefined>();
  // Live count of slots the draft occupies against the cap = staged chips that
  // are already present + slots reserved for accepted files whose chip has not
  // been added yet. Read instead of the `attachments` state closure when
  // enforcing the count cap so two rapid back-to-back picks (before a re-render)
  // can't both see a stale length and together exceed the limit (FR-020).
  // Invariant: stagedCountRef === (present chips) + pendingReservationRef.
  const stagedCountRef = useRef(0);
  // Slots reserved by an in-flight `attachFiles` batch whose chips have not yet
  // been added (one is decremented as each chip lands). Tracked separately so a
  // `removeAttachment` mid-batch can subtract the removed chip without clobbering
  // the reservations for files later in the same batch (which would otherwise let
  // a subsequent pick exceed the cap client-side).
  const pendingReservationRef = useRef(0);
  // Mirrors the current `conversationId` for async upload callbacks: an upload
  // that resolves/rejects after the user switched conversations must not paint
  // the new conversation's composer (stale error / stale chip update).
  const conversationIdRef = useRef(conversationId);

  const enabled = Boolean(storageConfig?.canUpload);

  // Staged uploads land in the *current* conversation's temporary bucket. When
  // the selected conversation changes, drop any unsent draft so a later send
  // never carries a previous conversation's document ids — the server READ-gates
  // them to the new bucket and would reject the whole send (the orphaned
  // temporary uploads are swept server-side, FR-012).
  // useLayoutEffect (not useEffect) so the reset commits before paint: a cached
  // bucket conversation must never render for even one frame with the previous
  // conversation's staged ids.
  useLayoutEffect(() => {
    conversationIdRef.current = conversationId;
    setAttachments([]);
    setError(undefined);
    stagedCountRef.current = 0;
    pendingReservationRef.current = 0;
  }, [conversationId]);

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
    // The conversation this batch belongs to; if it changes while an upload is
    // in flight, later resolutions/rejections must not paint the new one.
    const requestConversationId = conversationId;
    setError(undefined);
    if (!storageConfig) return;

    const { accepted, rejected } = validateAttachments(files, {
      existingCount: stagedCountRef.current,
      allowedMimeTypes: storageConfig.allowedMimeTypes?.length ? storageConfig.allowedMimeTypes : undefined,
      maxFileSizeBytes: storageConfig.maxFileSize || undefined,
    });

    if (rejected.length > 0) {
      setError(describeRejection(rejected[0]));
    }

    // Reserve the accepted slots synchronously (before the first upload await)
    // so a back-to-back pick validates against the new count, not the stale one.
    // The reservation is also tracked as `pending` and drawn down one-per-chip
    // below, so a mid-batch `removeAttachment` can't discard the not-yet-added
    // slots.
    stagedCountRef.current += accepted.length;
    pendingReservationRef.current += accepted.length;

    for (const file of accepted) {
      const stagedId = `${file.name}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
      setAttachments(prev => [...prev, { id: stagedId, name: file.name, status: 'uploading', mimeType: file.type }]);
      // This reserved slot is now a present chip.
      pendingReservationRef.current -= 1;

      try {
        const { data } = await uploadFile({
          variables: {
            file,
            uploadData: { storageBucketId: storageConfig.storageBucketId, temporaryLocation: true },
          },
        });
        // Conversation switched away while this upload was in flight — the draft
        // (and its refs) were reset for the new conversation; drop the result.
        if (conversationIdRef.current !== requestConversationId) return;
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
        // Same guard as the success path: a rejection from a previous
        // conversation must not surface a spurious error on the current one.
        if (conversationIdRef.current !== requestConversationId) return;
        setAttachments(prev =>
          prev.map(attachment => (attachment.id === stagedId ? { ...attachment, status: 'error' } : attachment))
        );
        setError(t('comments.attachments.uploadFailed'));
      }
    }
  };

  const removeAttachment = (id: string): void => {
    setAttachments(prev => {
      const next = prev.filter(attachment => attachment.id !== id);
      // Re-derive from the invariant (present chips + pending reservations)
      // rather than `next.length` alone, so removing an already-added chip while
      // later files in the same batch are still uploading does not discard their
      // reserved slots. Idempotent under a double-invoked updater.
      stagedCountRef.current = next.length + pendingReservationRef.current;
      // Re-derive the error from what remains: a stale validation/upload message
      // for a now-removed file should not linger. Keep the upload-failed message
      // only while some staged attachment is still in an error state.
      setError(
        next.some(attachment => attachment.status === 'error') ? t('comments.attachments.uploadFailed') : undefined
      );
      return next;
    });
  };

  const reset = (): void => {
    setAttachments([]);
    setError(undefined);
    stagedCountRef.current = 0;
    pendingReservationRef.current = 0;
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

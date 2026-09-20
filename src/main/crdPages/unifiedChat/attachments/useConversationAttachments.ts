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

/** Browsers differ in how reliably they map a MIME type to file-picker extensions
 *  (a permitted `.docx` shows up greyed out), so offer both the type and its known
 *  extension(s). Types absent from the map still contribute their MIME type. */
const mimeTypesToAccept = (mimeTypes: readonly string[]): string =>
  mimeTypes.flatMap(mime => (MIME_TO_EXT[mime] ? [mime, MIME_TO_EXT[mime]] : [mime])).join(',');

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
  /** Clears all staged attachments + error (call after a successful send).
   *  Pass the conversation the send belonged to so a selection change during the
   *  in-flight mutation cannot wipe the newly-selected conversation's draft. */
  reset: (forConversationId?: string) => void;
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
  // Only the message that CANNOT be derived from the staged chips lives in
  // state: a rejected pick never becomes a chip, so nothing on screen implies
  // it. The upload-failure message is fully derivable (some chip is in `error`
  // status) and is computed below — keeping it out of state is what lets the
  // upload-failure and removal paths use pure `setAttachments` updaters. React
  // may invoke an updater more than once, or discard the render it ran in, so
  // an updater must never call another setter or write a ref.
  const [validationError, setValidationError] = useState<string | undefined>();
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

  // One source for both the picker's `accept` and the validator's allow-list, so the
  // file chooser can never offer a type the validator rejects — nor grey out one it
  // would have accepted.
  const effectiveAllowedMimeTypes = storageConfig?.allowedMimeTypes?.length
    ? storageConfig.allowedMimeTypes
    : DEFAULT_ALLOWED_ATTACHMENT_MIME_TYPES;

  // Keep the count ref in sync with *committed* state. `attachFiles` still
  // reserves its slots synchronously below (before its first await) to cover the
  // window before this commit; from then on the invariant is re-derived here
  // rather than from inside a `setAttachments` updater, so a render React
  // discards can never leave the ref describing state that never landed.
  // Declared BEFORE the conversation-switch effect below so that effect's reset
  // to 0 wins on the commit where the selection changes.
  useLayoutEffect(() => {
    stagedCountRef.current = attachments.length + pendingReservationRef.current;
  }, [attachments]);

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
    setValidationError(undefined);
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
    // Drop a stale rejection message from an earlier pick. The upload-failed
    // message is NOT dropped here — it is derived from the staged chips, so it
    // survives exactly as long as the failed chip that disables Send does,
    // leaving the user something on screen to act on.
    setValidationError(undefined);
    if (!storageConfig) return;

    const { accepted, rejected } = validateAttachments(files, {
      existingCount: stagedCountRef.current,
      allowedMimeTypes: effectiveAllowedMimeTypes,
      maxFileSizeBytes: storageConfig.maxFileSize || undefined,
    });

    if (rejected.length > 0) {
      setValidationError(describeRejection(rejected[0]));
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
        // Pure updater: flag the chip and nothing else. The chip may have been
        // removed while its upload was in flight, in which case this maps over
        // nothing — and because the error message is derived from the staged
        // chips, no "remove the file" text is raised for a chip the user can no
        // longer see.
        setAttachments(prev =>
          prev.map(attachment => (attachment.id === stagedId ? { ...attachment, status: 'error' } : attachment))
        );
      }
    }
  };

  const removeAttachment = (id: string): void => {
    // A rejection message describes a pick the user is now editing away from, so
    // it should not linger. The upload-failed message needs no handling: it is
    // derived, and disappears with the last chip still in `error` status.
    setValidationError(undefined);
    // Pure updater. The count ref is re-derived from committed state by the
    // layout effect above, which reads `pendingReservationRef` too — so removing
    // an already-added chip while later files in the same batch are still
    // uploading does not discard their reserved slots.
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  /**
   * Clears all staged attachments + error (call after a successful send).
   *
   * Pass the conversation the send belonged to: the selection can move while the
   * send mutation is in flight, and an unpinned reset would then wipe a draft
   * the user has already started staging in the conversation they switched TO.
   * Same pinning the adjacent `clearDraft(conversationId)` does. Omitting the
   * argument resets unconditionally.
   */
  const reset = (forConversationId?: string): void => {
    if (forConversationId !== undefined && forConversationId !== conversationIdRef.current) {
      return;
    }
    setAttachments([]);
    setValidationError(undefined);
    stagedCountRef.current = 0;
    pendingReservationRef.current = 0;
  };

  // The picker must offer exactly what `validateAttachments` accepts — it falls back
  // to the curated default when the bucket declares no policy, so the picker does too
  // (otherwise it offered everything and the validator then rejected it).
  const accept = storageConfig ? mimeTypesToAccept(effectiveAllowedMimeTypes) : undefined;

  // A rejected pick outranks a failed upload: it is the message for what the
  // user just did. Otherwise surface the upload failure for as long as a failed
  // chip is staged — that chip is what disables Send, so its explanation has to
  // stay on screen alongside it.
  const error =
    validationError ??
    (attachments.some(attachment => attachment.status === 'error')
      ? t('comments.attachments.uploadFailed')
      : undefined);

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

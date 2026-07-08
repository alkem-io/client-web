import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReplaceCollaboraDocumentMutation } from '@/core/apollo/generated/apollo-hooks';
import type { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { DocumentImportError } from '@/crd/forms/callout/DocumentImportZone';
import { ReplaceCollaboraDocumentDialog } from '@/crd/forms/callout/ReplaceCollaboraDocumentDialog';
import {
  collaboraExtensionForType,
  collaboraTypeLabelKeyForType,
  isSameCollaboraDocumentType,
} from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraDocumentTypeFromFile';
import {
  COLLABORA_IMPORT_ACCEPT_ATTR,
  COLLABORA_IMPORT_EXTENSIONS_P1,
  COLLABORA_IMPORT_MAX_BYTES,
} from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraImportFormats';
import { filenameWithoutExtension } from '@/domain/collaboration/calloutContributions/collaboraDocument/filenameWithoutExtension';
import { validateCollaboraImportFile } from '@/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile';

type CollaboraFramingReplaceConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The Collabora document whose backing file is being replaced. */
  collaboraDocumentId: string;
  /** The current document's type — drives the same-type pre-check (FR-006). */
  currentDocumentType: CollaboraDocumentType | string;
  /** The current document's display name, shown for review (FR-015). */
  currentTitle: string;
};

// Server error `extensions.code`s we map to a specific client surface, mirroring
// the create-callout upload path (CalloutFormConnector). Anything else — including
// the active-edit block and content/type rejections, which arrive as BAD_USER_INPUT
// ValidationExceptions — surfaces the server's own message inline (FR-004/005/006/012/013).
const CODE_FORMAT_NOT_SUPPORTED = 'FORMAT_NOT_SUPPORTED';
const CODE_STORAGE_UPLOAD_FAILED = 'STORAGE_UPLOAD_FAILED';
const CODE_STORAGE_SERVICE_UNAVAILABLE = 'STORAGE_SERVICE_UNAVAILABLE';

/**
 * Container for the Collabora framing document **replace** flow
 * (workspace#014-officedocs-replace-file). Owns the staged file, the client-side
 * validation (extension + size via `validateCollaboraImportFile`, plus the
 * same-type pre-check), the editable title, the replace mutation, and the mapping
 * of both client and server errors to user-readable messages. Renders the
 * purpose-built `ReplaceCollaboraDocumentDialog`.
 */
export function CollaboraFramingReplaceConnector({
  open,
  onOpenChange,
  collaboraDocumentId,
  currentDocumentType,
  currentTitle,
}: CollaboraFramingReplaceConnectorProps) {
  const { t } = useTranslation('crd-space');
  const notify = useNotification();

  const [file, setFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<DocumentImportError | null>(null);
  const [titleValue, setTitleValue] = useState('');
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null);

  const [replaceCollaboraDocument, { loading }] = useReplaceCollaboraDocumentMutation();

  const formatList = COLLABORA_IMPORT_EXTENSIONS_P1.join(', ');
  const capMb = Math.round(COLLABORA_IMPORT_MAX_BYTES / (1024 * 1024));

  // The replacement must be the SAME type as the current document (FR-006), so
  // narrow the picker + hint to just that type's extension and name what the
  // current document is. Fall back to the full allowlist for an unmapped type.
  const currentExtension = collaboraExtensionForType(currentDocumentType);
  const currentTypeLabelKey = collaboraTypeLabelKeyForType(currentDocumentType);
  const currentTypeLabel = currentTypeLabelKey ? t(currentTypeLabelKey) : undefined;
  const acceptAttr = currentExtension ?? COLLABORA_IMPORT_ACCEPT_ATTR;
  const acceptsLabel = currentExtension
    ? t('callout.documentReplaceAccepts', { ext: currentExtension, cap: capMb })
    : t('callout.documentImportMaxSize', { cap: capMb });

  /**
   * Clear the staged file + its derived title. Used on cancel and on client-side
   * rejections; server-side rejections intentionally keep the file staged (the
   * user retries via the always-visible `serverErrorMessage` alert).
   */
  const clearStagedFile = () => {
    setFile(null);
    setTitleValue('');
  };

  const reset = () => {
    clearStagedFile();
    setImportError(null);
    setServerErrorMessage(null);
  };

  const handleFileChange = (next: File | null) => {
    setServerErrorMessage(null);
    if (!next) {
      setImportError(null);
      clearStagedFile();
      return;
    }

    // Client-side pre-checks: extension + size (FR-004/FR-005), then same-type (FR-006).
    // Nothing is staged and no network call is made until every check passes.
    const validation = validateCollaboraImportFile([next]);
    if (!validation.ok) {
      setImportError(validation.error);
      clearStagedFile();
      return;
    }
    if (!isSameCollaboraDocumentType(next.name, currentDocumentType)) {
      setImportError({ kind: 'different-type' });
      clearStagedFile();
      return;
    }

    // Prefill the editable title with the incoming file's name (FR-015). The staged
    // file card shows the file itself, so we don't display the name separately.
    setImportError(null);
    setFile(next);
    setTitleValue(filenameWithoutExtension(next.name));
  };

  // In the replace flow the accepted set is exactly the current document's
  // type/extension (FR-006), so an unsupported file AND a wrong-but-allowed
  // OfficeDocs type both mean the same thing: it must match the current
  // document. Name the expected type when we know it, and only fall back to the
  // generic allowlist message for an unmapped current type.
  const sameTypeMessage =
    currentTypeLabel && currentExtension
      ? t('callout.documentReplaceErrorSameType', { type: currentTypeLabel, ext: currentExtension })
      : t('callout.documentImportErrorUnsupported', { formats: formatList });

  const importErrorMessage: string | null = importError
    ? (() => {
        switch (importError.kind) {
          case 'extension':
          case 'different-type':
            return sameTypeMessage;
          case 'size':
            return t('callout.documentImportErrorTooLarge', { cap: capMb });
          case 'multiple-files':
            return t('callout.documentImportErrorMultiple');
          case 'folder':
            return t('callout.documentImportErrorFolder');
          default:
            return null;
        }
      })()
    : null;

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const handleServerError = (err: unknown) => {
    const graphQLError = err instanceof ApolloError ? err.graphQLErrors[0] : undefined;
    const code = graphQLError?.extensions?.code as string | undefined;

    // ALL server-side rejections surface via serverErrorMessage — the dialog's
    // always-visible alert. The import-zone error surface only renders in the
    // no-file state, so it cannot be reused once a file is staged.
    if (code === CODE_FORMAT_NOT_SUPPORTED) {
      setServerErrorMessage(t('callout.documentImportErrorUnsupported', { formats: formatList }));
      return;
    }
    if (code === CODE_STORAGE_UPLOAD_FAILED) {
      setServerErrorMessage(t('callout.documentReplaceError'));
      return;
    }
    if (code === CODE_STORAGE_SERVICE_UNAVAILABLE) {
      setServerErrorMessage(t('callout.documentImportErrorServiceUnavailable'));
      return;
    }
    // Active-edit block (FR-013) and content/type rejections (FR-006/FR-012) arrive
    // as BAD_USER_INPUT ValidationExceptions carrying a user-readable message — the
    // client can't know lock state itself, so surface the server's message verbatim.
    const graphQLMessage = graphQLError?.message;
    if (graphQLMessage) {
      setServerErrorMessage(graphQLMessage);
      return;
    }
    // Un-coded failure (e.g. a pure networkError, or a non-Apollo throw): show a
    // localized generic message rather than a raw one, and log it — these are the
    // genuine infra failures worth capturing in Sentry.
    setServerErrorMessage(t('callout.documentReplaceError'));
    logError(err instanceof Error ? err : new Error('replaceCollaboraDocument mutation failed'));
  };

  const handleConfirm = async () => {
    if (!file || importError) return;
    setServerErrorMessage(null);
    try {
      await replaceCollaboraDocument({
        variables: {
          file,
          // The chosen title is persisted as the document's display name by the
          // server (feature 016 / FR-009 / FR-015); omit when the field is blank.
          replaceData: { ID: collaboraDocumentId, displayName: titleValue.trim() || undefined },
        },
      });
      notify(t('callout.documentReplaceSuccess'), 'success');
      reset();
      onOpenChange(false);
    } catch (err) {
      handleServerError(err);
    }
  };

  return (
    <ReplaceCollaboraDocumentDialog
      open={open}
      onOpenChange={onOpenChange}
      acceptAttr={acceptAttr}
      file={file}
      onFileChange={handleFileChange}
      importError={importError}
      onImportError={setImportError}
      importErrorMessage={importErrorMessage}
      serverErrorMessage={serverErrorMessage}
      currentTitle={currentTitle}
      currentTypeLabel={currentTypeLabel}
      titleValue={titleValue}
      onTitleChange={setTitleValue}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      loading={loading}
      labels={{
        dialogTitle: t('callout.documentReplaceTitle'),
        description: t('callout.documentReplaceDescription'),
        importHint: t('callout.documentImportHint'),
        importMaxSize: acceptsLabel,
        importRemoveFile: t('callout.documentImportRemoveFile'),
        currentTitleLabel: t('callout.documentReplaceCurrentTitleLabel'),
        titleFieldLabel: t('callout.documentReplaceTitleFieldLabel'),
        confirmLabel: t('callout.documentReplaceConfirm'),
        cancelLabel: t('dialogs.cancel'),
      }}
    />
  );
}

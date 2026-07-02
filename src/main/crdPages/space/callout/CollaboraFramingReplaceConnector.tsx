import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReplaceCollaboraDocumentMutation } from '@/core/apollo/generated/apollo-hooks';
import type { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { DocumentImportError } from '@/crd/forms/callout/DocumentImportZone';
import { ReplaceCollaboraDocumentDialog } from '@/crd/forms/callout/ReplaceCollaboraDocumentDialog';
import { isSameCollaboraDocumentType } from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraDocumentTypeFromFile';
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
  /** Called after a successful replace so the caller can refresh the document view. */
  onReplaced?: () => void;
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
  onReplaced,
}: CollaboraFramingReplaceConnectorProps) {
  const { t } = useTranslation('crd-space');
  const notify = useNotification();

  const [file, setFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<DocumentImportError | null>(null);
  const [incomingTitle, setIncomingTitle] = useState<string | null>(null);
  const [titleValue, setTitleValue] = useState('');
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null);

  const [replaceCollaboraDocument, { loading }] = useReplaceCollaboraDocumentMutation();

  const formatList = COLLABORA_IMPORT_EXTENSIONS_P1.join(', ');
  const capMb = Math.round(COLLABORA_IMPORT_MAX_BYTES / (1024 * 1024));

  const reset = () => {
    setFile(null);
    setImportError(null);
    setIncomingTitle(null);
    setTitleValue('');
    setServerErrorMessage(null);
  };

  const handleFileChange = (next: File | null) => {
    setServerErrorMessage(null);
    if (!next) {
      setFile(null);
      setImportError(null);
      setIncomingTitle(null);
      setTitleValue('');
      return;
    }

    // Client-side pre-checks: extension + size (FR-004/FR-005), then same-type (FR-006).
    // Nothing is staged and no network call is made until every check passes.
    const validation = validateCollaboraImportFile([next]);
    if (!validation.ok) {
      setImportError(validation.error);
      setFile(null);
      setIncomingTitle(null);
      setTitleValue('');
      return;
    }
    if (!isSameCollaboraDocumentType(next.name, currentDocumentType)) {
      setImportError({ kind: 'different-type' });
      setFile(null);
      setIncomingTitle(null);
      setTitleValue('');
      return;
    }

    const derivedTitle = filenameWithoutExtension(next.name);
    setImportError(null);
    setFile(next);
    setIncomingTitle(derivedTitle);
    setTitleValue(derivedTitle);
  };

  const importErrorMessage: string | null = importError
    ? (() => {
        switch (importError.kind) {
          case 'extension':
            return t('callout.documentImportErrorUnsupported', { formats: formatList });
          case 'size':
            return t('callout.documentImportErrorTooLarge', { cap: capMb });
          case 'multiple-files':
            return t('callout.documentImportErrorMultiple');
          case 'folder':
            return t('callout.documentImportErrorFolder');
          case 'different-type':
            return t('callout.documentReplaceErrorSameType');
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

    if (code === CODE_FORMAT_NOT_SUPPORTED) {
      setImportError({ kind: 'extension', received: '' });
      return;
    }
    if (code === CODE_STORAGE_UPLOAD_FAILED) {
      setImportError({ kind: 'size', bytes: file?.size ?? 0, maxBytes: COLLABORA_IMPORT_MAX_BYTES });
      return;
    }
    if (code === CODE_STORAGE_SERVICE_UNAVAILABLE) {
      setServerErrorMessage(t('callout.documentImportErrorServiceUnavailable'));
      return;
    }
    // Active-edit block (FR-013) and content/type rejections (FR-006/FR-012) arrive
    // as BAD_USER_INPUT ValidationExceptions carrying a user-readable message — the
    // client can't know lock state itself, so surface the server's message verbatim.
    const message = graphQLError?.message ?? (err instanceof Error ? err.message : undefined);
    setServerErrorMessage(message ?? t('callout.documentReplaceError'));
    if (!(err instanceof ApolloError)) {
      logError(new Error('replaceCollaboraDocument mutation failed', { cause: err as Error }));
    }
  };

  const handleConfirm = async () => {
    if (!file || importError) return;
    setServerErrorMessage(null);
    try {
      await replaceCollaboraDocument({
        variables: {
          file,
          // `displayName` is sent for forward-compatibility but NOT applied by the
          // server in this feature (FR-009/FR-015); persisting a rename is `016`.
          replaceData: { ID: collaboraDocumentId, displayName: titleValue.trim() || undefined },
        },
      });
      notify(t('callout.documentReplaceSuccess'), 'success');
      onReplaced?.();
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
      acceptAttr={COLLABORA_IMPORT_ACCEPT_ATTR}
      file={file}
      onFileChange={handleFileChange}
      importError={importError}
      onImportError={setImportError}
      importErrorMessage={importErrorMessage}
      serverErrorMessage={serverErrorMessage}
      currentTitle={currentTitle}
      incomingTitle={incomingTitle}
      titleValue={titleValue}
      onTitleChange={setTitleValue}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      loading={loading}
      labels={{
        dialogTitle: t('callout.documentReplaceTitle'),
        description: t('callout.documentReplaceDescription'),
        importHint: t('callout.documentImportHint'),
        importMaxSize: t('callout.documentImportMaxSize', { cap: capMb }),
        importRemoveFile: t('callout.documentImportRemoveFile'),
        currentTitleLabel: t('callout.documentReplaceCurrentTitleLabel'),
        incomingTitleLabel: t('callout.documentReplaceIncomingTitleLabel'),
        titleFieldLabel: t('callout.documentReplaceTitleFieldLabel'),
        confirmLabel: t('callout.documentReplaceConfirm'),
        cancelLabel: t('dialogs.cancel'),
      }}
    />
  );
}

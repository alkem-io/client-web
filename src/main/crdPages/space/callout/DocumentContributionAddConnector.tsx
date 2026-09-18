import { ApolloError } from '@apollo/client';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCreateCollaboraDocumentOnCalloutMutation,
  useImportCollaboraDocumentMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { AuthorizationPrivilege, CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ContributionAddCard } from '@/crd/components/contribution/ContributionAddCard';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
import {
  CollaboraDocumentTypePicker,
  type CollaboraDocumentTypeValue,
} from '@/crd/forms/callout/CollaboraDocumentTypePicker';
import type { DocumentImportError } from '@/crd/forms/callout/DocumentImportZone';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import {
  COLLABORA_IMPORT_ACCEPT_ATTR,
  COLLABORA_IMPORT_EXTENSIONS_P1,
  COLLABORA_IMPORT_MAX_BYTES,
} from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraImportFormats';
import { deriveCollaboraImportErrorMessage } from '@/domain/collaboration/calloutContributions/collaboraDocument/deriveCollaboraImportErrorMessage';
import { validateCollaboraImportFile } from '@/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { DocumentContributionConnector } from './DocumentContributionConnector';

// `open` + `onOpenChange` form a discriminated pair: pass both (controlled) or neither
// (uncontrolled). Passing only one would compile but leave the dialog inert in one direction.
type ControlledOpen = { open: boolean; onOpenChange: (open: boolean) => void };
type UncontrolledOpen = { open?: undefined; onOpenChange?: undefined };

type DocumentContributionAddConnectorProps = {
  calloutId: string;
  /** Threaded to the "just created" editor's rename-permission check (research R10). */
  calloutPrivileges?: AuthorizationPrivilege[];
  onCreated?: () => void;
  /** When true, suppresses the in-grid trigger card; a parent renders its own trigger and controls `open`. */
  inlineTrigger?: boolean;
} & (ControlledOpen | UncontrolledOpen);

const DEFAULT_DOCUMENT_TYPE: CollaboraDocumentTypeValue = 'WORDPROCESSING';

/**
 * "Add document" flow with two creation paths, mirroring the callout-framing document editor:
 *   - Blank-create: pick a title + a document type (Text / Spreadsheet / Presentation) and the
 *     server provisions an empty Collabora document via `createContributionOnCallout`.
 *   - Upload: stage an existing file (`importCollaboraDocument`), whose type is derived from the
 *     uploaded file's sniffed MIME server-side.
 * The two are mutually exclusive within the shared `CollaboraDocumentTypePicker`: staging a file
 * dims the type cards, and picking a card clears the staged file.
 *
 * On success either path opens the newly-created contribution's editor immediately — mirroring
 * `WhiteboardContributionAddConnector`'s `editingWhiteboard` pattern (own local state, own
 * rendered overlay, no delete affordance at this ephemeral point).
 */
export function DocumentContributionAddConnector({
  calloutId,
  calloutPrivileges,
  onCreated,
  inlineTrigger,
  open: controlledOpen,
  onOpenChange,
}: DocumentContributionAddConnectorProps) {
  const { t } = useTranslation('crd-space');
  const notify = useNotification();
  const fallbackName = t('callout.defaultDocumentName');
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : internalOpen;
  const setDialogOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const [documentName, setDocumentName] = useState(fallbackName);
  const [documentType, setDocumentType] = useState<CollaboraDocumentTypeValue>(DEFAULT_DOCUMENT_TYPE);
  const [file, setFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<DocumentImportError | null>(null);
  const [importDocument] = useImportCollaboraDocumentMutation();
  const [createDocument] = useCreateCollaboraDocumentOnCalloutMutation();
  const [editingContributionId, setEditingContributionId] = useState<string | undefined>();

  const resetStagedState = () => {
    setDocumentName(fallbackName);
    setDocumentType(DEFAULT_DOCUMENT_TYPE);
    setFile(null);
    setImportError(null);
  };

  const handleOpen = () => {
    resetStagedState();
    setDialogOpen(true);
  };

  // Direct close with no discard prompt — used by the success paths (the user's
  // input has been committed, so there is nothing to lose). Cancel / Esc / overlay /
  // X route through the guard's `requestClose`/`handleOpenChange` instead.
  const closeDialog = () => {
    setDialogOpen(false);
  };

  // When the parent opens the dialog (inline-trigger path), reset staged state — mirrors what
  // `handleOpen` does for the in-grid trigger card path.
  useEffect(() => {
    if (dialogOpen) {
      setDocumentName(fallbackName);
      setDocumentType(DEFAULT_DOCUMENT_TYPE);
      setFile(null);
      setImportError(null);
    }
  }, [dialogOpen, fallbackName]);

  const formatList = COLLABORA_IMPORT_EXTENSIONS_P1.join(', ');
  const capMb = Math.round(COLLABORA_IMPORT_MAX_BYTES / (1024 * 1024));
  const errorMessage = deriveCollaboraImportErrorMessage(importError, t, formatList, capMb);

  const handleFileChange = (next: File | null) => {
    if (!next) {
      setFile(null);
      return;
    }
    // Client-side pre-check BEFORE any network call.
    const validation = validateCollaboraImportFile([next]);
    if (!validation.ok) {
      setImportError(validation.error);
      setFile(null);
      return;
    }
    setImportError(null);
    setFile(next);
  };

  const trimmedName = documentName.trim();

  const [handleSubmit, submitting] = useLoadingState(async () => {
    if (file) {
      // Upload path — the document type is derived server-side from the file's sniffed MIME, so it
      // is NOT sent. The title is sent only when the user typed something other than the default;
      // otherwise the server derives it from the uploaded filename.
      const displayNameOverride = trimmedName && trimmedName !== fallbackName ? trimmedName : undefined;
      try {
        const { data } = await importDocument({
          variables: {
            file,
            uploadData: { calloutID: calloutId, ...(displayNameOverride ? { displayName: displayNameOverride } : {}) },
          },
          refetchQueries: ['CalloutDetails', 'CalloutContributions'],
          awaitRefetchQueries: true,
        });
        onCreated?.();
        closeDialog();
        const createdContributionId = data?.importCollaboraDocument.id;
        if (createdContributionId) setEditingContributionId(createdContributionId);
      } catch (err) {
        // Map server errors the same way the framing-upload flow does.
        // Decisions are driven by the structured `extensions.code`, never the error's message.
        const handledCodes = ['FORMAT_NOT_SUPPORTED', 'STORAGE_UPLOAD_FAILED', 'STORAGE_SERVICE_UNAVAILABLE'] as const;
        const code =
          err instanceof ApolloError
            ? err.graphQLErrors.find(gqlErr =>
                handledCodes.includes(gqlErr.extensions?.code as (typeof handledCodes)[number])
              )?.extensions?.code
            : undefined;

        if (code === 'FORMAT_NOT_SUPPORTED') {
          setImportError({ kind: 'extension', received: '' });
          return;
        }
        if (code === 'STORAGE_UPLOAD_FAILED') {
          setImportError({ kind: 'size', bytes: file.size, maxBytes: COLLABORA_IMPORT_MAX_BYTES });
          return;
        }
        if (code === 'STORAGE_SERVICE_UNAVAILABLE') {
          notify(t('callout.documentImportErrorServiceUnavailable'), 'error');
          return;
        }
        logError(new Error('Document contribution import failed', { cause: err as Error }));
      }
      return;
    }

    // Blank-create path — an empty document with the chosen title and type.
    if (!trimmedName) return;
    try {
      const { data } = await createDocument({
        variables: {
          calloutId,
          collaboraDocument: {
            displayName: trimmedName,
            documentType: documentType as CollaboraDocumentType,
          },
        },
        refetchQueries: ['CalloutDetails', 'CalloutContributions'],
        awaitRefetchQueries: true,
      });
      onCreated?.();
      closeDialog();
      const createdContributionId = data?.createContributionOnCallout.id;
      if (createdContributionId) setEditingContributionId(createdContributionId);
    } catch (err) {
      const code =
        err instanceof ApolloError
          ? err.graphQLErrors.find(gqlErr => gqlErr.extensions?.code === 'STORAGE_SERVICE_UNAVAILABLE')?.extensions
              ?.code
          : undefined;
      if (code === 'STORAGE_SERVICE_UNAVAILABLE') {
        notify(t('callout.documentImportErrorServiceUnavailable'), 'error');
        return;
      }
      logError(new Error('Document contribution create failed', { cause: err as Error }));
    }
  });

  // The user has authored something worth guarding once they staged a file or
  // changed the title away from its default. Route every close affordance
  // (Cancel, Esc, overlay click, the X control) through the discard-confirm guard.
  const isDirty = file !== null || trimmedName !== fallbackName;
  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty,
    onClose: closeDialog,
    blockClose: submitting,
  });

  return (
    <>
      {!inlineTrigger && <ContributionAddCard label={t('callout.addDocument')} icon={FileText} onClick={handleOpen} />}
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden" closeLabel={t('a11y.close')}>
          <DialogHeader className="shrink-0">
            <DialogTitle>{t('callout.createDocument')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
            <div className="flex flex-col gap-2">
              <label htmlFor="crd-create-document-name" className="text-caption text-muted-foreground">
                {t('callout.documentNameLabel')}
              </label>
              <Input
                id="crd-create-document-name"
                value={documentName}
                onChange={e => setDocumentName(e.target.value)}
                autoFocus={true}
                disabled={submitting}
              />
            </div>
            <CollaboraDocumentTypePicker
              value={documentType}
              onChange={setDocumentType}
              upload={{
                acceptAttr: COLLABORA_IMPORT_ACCEPT_ATTR,
                file,
                onFileChange: handleFileChange,
                onError: setImportError,
                error: importError,
                errorMessage,
                busy: submitting,
                labelHint: t('callout.documentImportHint'),
                labelMaxSize: t('callout.documentImportMaxSize', { cap: capMb }),
                labelRemoveFile: t('callout.documentImportRemoveFile'),
                labelOr: t('callout.documentImportOr'),
              }}
            />
          </div>
          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={requestClose} disabled={submitting}>
              {t('dialogs.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || (!file && !trimmedName)} aria-busy={submitting}>
              {t('dialogs.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guardElement}
      {editingContributionId && (
        <DocumentContributionConnector
          open={true}
          contributionId={editingContributionId}
          calloutPrivileges={calloutPrivileges}
          onClose={() => setEditingContributionId(undefined)}
        />
      )}
    </>
  );
}

import { ApolloError } from '@apollo/client';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useImportCollaboraDocumentMutation } from '@/core/apollo/generated/apollo-hooks';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ContributionAddCard } from '@/crd/components/contribution/ContributionAddCard';
import { type DocumentImportError, DocumentImportZone } from '@/crd/forms/callout/DocumentImportZone';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import {
  COLLABORA_IMPORT_ACCEPT_ATTR,
  COLLABORA_IMPORT_EXTENSIONS_P1,
  COLLABORA_IMPORT_MAX_BYTES,
} from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraImportFormats';
import { deriveCollaboraImportErrorMessage } from '@/domain/collaboration/calloutContributions/collaboraDocument/deriveCollaboraImportErrorMessage';
import { validateCollaboraImportFile } from '@/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile';
import useLoadingState from '@/domain/shared/utils/useLoadingState';

// `open` + `onOpenChange` form a discriminated pair: pass both (controlled) or neither
// (uncontrolled). Passing only one would compile but leave the dialog inert in one direction.
type ControlledOpen = { open: boolean; onOpenChange: (open: boolean) => void };
type UncontrolledOpen = { open?: undefined; onOpenChange?: undefined };

type DocumentContributionAddConnectorProps = {
  calloutId: string;
  onCreated?: () => void;
  /** Fired with the newly-created contribution's id so a parent can open its editor immediately. */
  onDocumentCreated?: (contributionId: string) => void;
  /** When true, suppresses the in-grid trigger card; a parent renders its own trigger and controls `open`. */
  inlineTrigger?: boolean;
} & (ControlledOpen | UncontrolledOpen);

/**
 * Upload-only "Add document" flow — the server's `importCollaboraDocument` mutation has no
 * blank-create counterpart, unlike Whiteboard/Memo (spec 116-document-responses Clarifications).
 * Reuses the exact same building blocks the framing document-upload flow already proved out:
 * `DocumentImportZone` for staging, `validateCollaboraImportFile` for the client-side pre-check,
 * and `deriveCollaboraImportErrorMessage` for both pre-check and server-rejection inline copy.
 */
export function DocumentContributionAddConnector({
  calloutId,
  onCreated,
  onDocumentCreated,
  inlineTrigger,
  open: controlledOpen,
  onOpenChange,
}: DocumentContributionAddConnectorProps) {
  const { t } = useTranslation('crd-space');
  const notify = useNotification();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const dialogOpen = isControlled ? controlledOpen : internalOpen;
  const setDialogOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const [file, setFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<DocumentImportError | null>(null);
  const [importDocument] = useImportCollaboraDocumentMutation();

  const handleOpen = () => {
    setFile(null);
    setImportError(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  // When the parent opens the dialog (inline-trigger path), reset staged state — mirrors what
  // `handleOpen` does for the in-grid trigger card path.
  useEffect(() => {
    if (dialogOpen) {
      setFile(null);
      setImportError(null);
    }
  }, [dialogOpen]);

  const formatList = COLLABORA_IMPORT_EXTENSIONS_P1.join(', ');
  const capMb = Math.round(COLLABORA_IMPORT_MAX_BYTES / (1024 * 1024));
  const errorMessage = deriveCollaboraImportErrorMessage(importError, t, formatList, capMb);

  const handleFileChange = (next: File | null) => {
    if (!next) {
      setFile(null);
      return;
    }
    // Client-side pre-check BEFORE any network call (FR-006).
    const validation = validateCollaboraImportFile([next]);
    if (!validation.ok) {
      setImportError(validation.error);
      setFile(null);
      return;
    }
    setImportError(null);
    setFile(next);
  };

  const [handleSubmit, submitting] = useLoadingState(async () => {
    if (!file) return;
    try {
      const { data } = await importDocument({
        variables: { file, uploadData: { calloutID: calloutId } },
        refetchQueries: ['CalloutDetails', 'CalloutContributions'],
        awaitRefetchQueries: true,
      });
      onCreated?.();
      handleClose();
      const createdContributionId = data?.importCollaboraDocument.id;
      if (createdContributionId) onDocumentCreated?.(createdContributionId);
    } catch (err) {
      // Map server errors the same way the framing-upload flow does (FR-010/FR-011).
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
  });

  return (
    <>
      {!inlineTrigger && <ContributionAddCard label={t('callout.addDocument')} icon={FileText} onClick={handleOpen} />}
      <Dialog
        open={dialogOpen}
        onOpenChange={open => {
          if (!open) handleClose();
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden" closeLabel={t('a11y.close')}>
          <DialogHeader className="shrink-0">
            <DialogTitle>{t('callout.addDocument')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
            <DocumentImportZone
              acceptAttr={COLLABORA_IMPORT_ACCEPT_ATTR}
              value={file}
              onChange={handleFileChange}
              onError={setImportError}
              error={importError}
              busy={submitting}
              labelHint={t('callout.documentImportHint')}
              labelMaxSize={t('callout.documentImportMaxSize', { cap: capMb })}
              labelRemoveFile={t('callout.documentImportRemoveFile')}
              errorMessage={errorMessage}
            />
          </div>
          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={handleClose} disabled={submitting}>
              {t('dialogs.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={!file || submitting} aria-busy={submitting}>
              {t('dialogs.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

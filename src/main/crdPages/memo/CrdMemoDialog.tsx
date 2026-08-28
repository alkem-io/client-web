import { useApolloClient } from '@apollo/client';
import type { Editor } from '@tiptap/react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateMemoDisplayNameMutation } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { useRegisterFullscreenEditor } from '@/core/ui/fullscreen/FullscreenEditorContext';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { CrdFullscreenButton } from '@/crd/components/common/CrdFullscreenButton';
import { Loading } from '@/crd/components/common/Loading';
import { ShareButton } from '@/crd/components/common/ShareButton';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { MemoCollabFooter } from '@/crd/components/memo/MemoCollabFooter';
import { MemoDisplayName } from '@/crd/components/memo/MemoDisplayName';
import { MemoEditorShell } from '@/crd/components/memo/MemoEditorShell';
import { CollaborativeMarkdownEditor } from '@/crd/forms/markdown/CollaborativeMarkdownEditor';
import type { CollabProviderLike, YDocLike } from '@/crd/forms/markdown/collabProviderTypes';
import { htmlToMarkdown } from '@/crd/forms/markdown/markdownConverter';
import { useMediaQuery } from '@/crd/hooks/useMediaQuery';
import useMemoManager from '@/domain/collaboration/memo/MemoManager/useMemoManager';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { useMarkdownEditorIntegration } from '@/main/crdPages/markdown/useMarkdownEditorIntegration';
import { CrdCollaborationSettings } from '@/main/crdPages/whiteboard/CrdCollaborationSettings';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { mapMemoFooterProps } from './memoFooterMapper';
import { useCrdMemoProvider } from './useCrdMemoProvider';

type CrdMemoDialogProps = {
  open: boolean;
  memoId: string;
  onClose: () => void;
  /** True when this is a memo contribution (deletable), false for framing */
  isContribution?: boolean;
  onDelete?: () => Promise<void> | void;
};

type CollaborativeMemoCloseParams = {
  freeze: () => void;
  persistPendingChanges?: () => Promise<void>;
  updatePreview: () => Promise<void>;
  onPersistenceFailed: () => void;
  teardown: () => void;
};

export async function closeCollaborativeMemo({
  freeze,
  persistPendingChanges,
  updatePreview,
  onPersistenceFailed,
  teardown,
}: CollaborativeMemoCloseParams): Promise<boolean> {
  freeze();
  if (persistPendingChanges) {
    try {
      await persistPendingChanges();
    } catch {
      onPersistenceFailed();
      return false;
    }
  }
  try {
    await updatePreview();
  } catch {
    // Preview cache hydration is best effort; the collaboration barrier above
    // is the content-safety boundary.
  }
  teardown();
  return true;
}

export function CrdMemoDialog({ open, memoId, onClose, isContribution = false, onDelete }: CrdMemoDialogProps) {
  const { t } = useTranslation('crd-space');
  const { t: tCommon } = useTranslation('crd-common');
  const notify = useNotification();
  useRegisterFullscreenEditor(open);
  const client = useApolloClient();
  const { memo, loading } = useMemoManager({ id: memoId });
  const editorRef = useRef<Editor | null>(null);
  const { isAuthenticated } = useAuthenticationContext();
  const { spaceLevel = SpaceLevel.L0 } = useUrlResolver();
  const { space } = useSpace();
  const { subspace } = useSubSpace();
  const myMembershipStatus =
    spaceLevel === SpaceLevel.L0
      ? space.about.membership?.myMembershipStatus
      : subspace.about.membership?.myMembershipStatus;
  const {
    ydoc,
    provider,
    connectionStatus,
    phase,
    access,
    hasEverSynced,
    hasUnconfirmedLocalChanges,
    isReadOnly,
    readOnlyCode,
    sessionEndCode,
    resumeEditing,
    retryNow,
    persistPendingChanges,
    memberCount,
    connectedUsers,
    user,
  } = useCrdMemoProvider({
    collaborationId: memoId,
  });

  // Memo images upload into the memo's own storage bucket (where collaborators have FileUpload),
  // not the ambient space bucket. Mirrors the legacy MUI `MemoDialog`, which passed the memo's
  // bucket explicitly. The memo always exists when this dialog is open, so no temporary location.
  const markdownIntegration = useMarkdownEditorIntegration({ storageBucketId: memo?.profile.storageBucket.id });

  // Fullscreen + share parity with the legacy MUI MemoDialog (which exposed both
  // in its header). `CrdFullscreenButton` reads/toggles fullscreen via the DOM
  // Fullscreen API internally; the shell switches to `inset-0` when `fullscreen` is set.
  const { fullscreen } = useFullscreen();
  const isSmallScreen = useMediaQuery('(max-width: 599.95px)');
  const isFullscreen = fullscreen || isSmallScreen;

  const handleEditorReady = (editor: Editor) => {
    editorRef.current = editor;
  };

  const [updateMemoDisplayName, { loading: savingDisplayName }] = useUpdateMemoDisplayNameMutation();
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [displayNameDraft, setDisplayNameDraft] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const closeInFlightRef = useRef(false);
  const [closing, setClosing] = useState(false);

  const privileges = memo?.authorization?.myPrivileges ?? [];
  const hasUpdatePrivileges = privileges.includes(AuthorizationPrivilege.Update);
  const hasDeletePrivileges = privileges.includes(AuthorizationPrivilege.Delete);
  const hasContributePrivileges = privileges.includes(AuthorizationPrivilege.Contribute);

  const canEditDisplayName = isContribution && hasUpdatePrivileges;
  const displayName = memo?.profile.displayName ?? t('memo.errors.loading');

  const handleStartEdit = () => {
    setDisplayNameDraft(displayName);
    setEditingDisplayName(true);
  };

  const handleSaveDisplayName = async () => {
    if (!displayNameDraft.trim() || displayNameDraft === displayName) {
      setEditingDisplayName(false);
      return;
    }
    await updateMemoDisplayName({ variables: { memoId, displayName: displayNameDraft.trim() } });
    setEditingDisplayName(false);
  };

  const handleCancelEdit = () => setEditingDisplayName(false);

  // Write the editor's current content directly to Apollo cache so previews update instantly.
  // The collab room debounces its snapshot save by ~2s; fetching from the server immediately returns stale data.
  // Instead, we grab the HTML from Tiptap, convert to markdown, and write it to the normalized
  // cache entry. Connectors schedule a delayed server fetch as a safety net.
  const handleClose = async () => {
    if (closeInFlightRef.current) return;
    closeInFlightRef.current = true;
    let closed = false;
    try {
      closed = await closeCollaborativeMemo({
        freeze: () => setClosing(true),
        persistPendingChanges:
          phase === 'terminal' || phase === 'replaceGeneration' ? undefined : persistPendingChanges,
        updatePreview: async () => {
          if (!editorRef.current) return;
          const markdown = await htmlToMarkdown(editorRef.current.getHTML());
          client.cache.modify({
            id: client.cache.identify({ __typename: 'Memo', id: memoId }),
            fields: {
              markdown: () => markdown,
            },
          });
        },
        onPersistenceFailed: () => notify(tCommon('callout.memo.saveFailed'), 'error'),
        teardown: onClose,
      });
    } finally {
      closeInFlightRef.current = false;
      if (!closed) setClosing(false);
    }
  };

  // The footer Delete button opens the confirmation; the actual delete runs from the
  // confirmation's `onConfirm` so users can't remove a memo with a stray click.
  const handleRequestDelete = onDelete ? () => setDeleteDialogOpen(true) : undefined;

  const handleConfirmDelete = onDelete
    ? async () => {
        setIsDeleting(true);
        setDeleteDialogOpen(false);
        onClose();
        try {
          await onDelete();
        } finally {
          setIsDeleting(false);
        }
      }
    : undefined;

  const footerProps = mapMemoFooterProps({
    connectionStatus,
    phase,
    access,
    isAuthenticated,
    readOnlyCode,
    sessionEndCode,
    memberCount,
    connectedUsers,
    isContribution,
    hasDeletePrivileges,
    onDelete: handleRequestDelete,
    onResumeEditing: resumeEditing,
    contentUpdatePolicy: memo?.contentUpdatePolicy,
    hasOwner: !!memo?.createdBy?.profile,
    myMembershipStatus,
  });

  // Initial load waits for the first sync. Once established, the same editor and
  // Y.Doc remain mounted through transient recovery; permissions, terminal
  // verdicts, and poisoned-generation replacement are the only edit locks.
  const editorDisabled = closing || isReadOnly || !hasContributePrivileges;
  const sessionEndMessage = sessionEndCode
    ? t(
        sessionEndCode === 'document-size-limit-exceeded'
          ? 'memo.footer.readonlyReason.sizeLimitExceeded'
          : 'memo.footer.readonlyReason.sessionEnded'
      )
    : undefined;

  const title = (
    <MemoDisplayName
      displayName={displayName}
      value={displayNameDraft}
      readOnly={!canEditDisplayName || closing}
      editing={editingDisplayName}
      saving={savingDisplayName}
      onChange={setDisplayNameDraft}
      onEdit={handleStartEdit}
      onSave={handleSaveDisplayName}
      onCancel={handleCancelEdit}
    />
  );

  const showLoadingState = loading || !memo || !ydoc || !provider;

  const handleCopyUnconfirmed = () => {
    const text = editorRef.current?.getText();
    if (text) void navigator.clipboard?.writeText(text);
  };

  const headerActions = (
    <>
      {/* Share dropdown. For users who can update the memo, it also hosts the content-update-policy
          control (Owner / Admins / Contributors) — parity with the CRD whiteboard and the legacy MUI
          memo dialog, and what makes the footer's "ask the owner to change the share settings" message
          actionable. The component is generic via `elementType="memo"`. */}
      <ShareButton url={memo?.profile.url} disabled={!memo?.profile.url}>
        {hasUpdatePrivileges && <CrdCollaborationSettings element={memo} elementType="memo" />}
      </ShareButton>
      {!isSmallScreen && <CrdFullscreenButton label={tCommon('fullscreen')} />}
    </>
  );

  return (
    <>
      <MemoEditorShell
        open={open}
        fullscreen={isFullscreen}
        onClose={handleClose}
        title={title}
        headerActions={headerActions}
        footer={
          <MemoCollabFooter
            {...footerProps}
            recovering={phase === 'recovering'}
            hasUnconfirmedChanges={
              hasUnconfirmedLocalChanges && (phase === 'recovering' || phase === 'terminal' || access === 'readOnly')
            }
            onRetry={retryNow}
            onCopy={handleCopyUnconfirmed}
            owner={
              memo?.createdBy?.profile
                ? { name: memo.createdBy.profile.displayName, url: memo.createdBy.profile.url }
                : undefined
            }
          />
        }
      >
        {showLoadingState ? (
          <Loading text={t('memo.errors.loading')} />
        ) : (
          <div className="h-full p-3 relative">
            {/* The collaborative editor is mounted once the unified collab
                provider completes its first Yjs sync, then stays mounted through
                transient recovery. Mounting before that first sync produces an editor instance that
                attaches to an empty/partial ydoc, which Tiptap then has to
                rebuild on the next render — and the rebuild race is what
                made just-created memos appear stuck on the first 1–3 opens
                (toolbar visible, typing ignored). Holding the mount means
                the editor's first render is its final render, with
                `disabled` driven purely by permissions. Mirrors the MUI
                memo dialog's "Connecting to collaboration service…" overlay. */}
            {sessionEndMessage && !hasUnconfirmedLocalChanges ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>{sessionEndMessage}</p>
              </div>
            ) : hasEverSynced ? (
              <CollaborativeMarkdownEditor
                ydoc={ydoc as unknown as YDocLike}
                provider={provider as unknown as CollabProviderLike}
                user={{ name: user.name, color: user.color }}
                disabled={editorDisabled}
                onReady={handleEditorReady}
                className="h-full"
                onImageUpload={markdownIntegration.onImageUpload}
                iframeAllowedUrls={markdownIntegration.iframeAllowedUrls}
                onError={markdownIntegration.onError}
                hideEmbedOption={true}
              />
            ) : (
              <Loading text={t('memo.footer.readonlyReason.connecting')} />
            )}
          </div>
        )}
      </MemoEditorShell>
      {handleConfirmDelete && (
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={t('memo.deleteConfirm.title')}
          description={t('memo.deleteConfirm.body')}
          confirmLabel={t('memo.deleteConfirm.confirm')}
          onConfirm={handleConfirmDelete}
          variant="destructive"
          loading={isDeleting}
        />
      )}
    </>
  );
}

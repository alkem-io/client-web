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

export const updateMemoMarkdownCache = (
  editor: Pick<Editor, 'getHTML'> | null,
  writeMarkdown: (markdown: string) => void,
  hadLocalEdits = true
): Promise<void> => {
  if (!editor || !hadLocalEdits) return Promise.resolve();
  return htmlToMarkdown(editor.getHTML()).then(writeMarkdown);
};

export function CrdMemoDialog({ open, memoId, onClose, isContribution = false, onDelete }: CrdMemoDialogProps) {
  const { t } = useTranslation('crd-space');
  const { t: tCommon } = useTranslation('crd-common');
  useRegisterFullscreenEditor(open);
  const client = useApolloClient();
  const notify = useNotification();
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
    lifecycle,
    lastSaveError,
    connectionStatus,
    synced,
    isReadOnly,
    memberCount,
    connectedUsers,
    user,
  } = useCrdMemoProvider({ collaborationId: memoId });

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
  const [closeBlocked, setCloseBlocked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const closeInFlight = useRef(false);

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
  const currentMarkdown = () => htmlToMarkdown(editorRef.current?.getHTML() ?? '');
  const finishClose = async () => {
    try {
      await updateMemoMarkdownCache(
        editorRef.current,
        markdown => {
          client.cache.modify({
            id: client.cache.identify({ __typename: 'Memo', id: memoId }),
            fields: { markdown: () => markdown },
          });
        },
        !!provider?.hasLocalEdits
      );
    } catch {
      // The connector's delayed refetch remains the cache fallback.
    }
    onClose();
  };
  const handleClose = async () => {
    if (closeInFlight.current) return;
    const unsaved = !!provider?.hasUnsavedChanges;
    if (unsaved && !(lifecycle.kind === 'active' && lifecycle.access === 'write' && lifecycle.save !== 'offline')) {
      setCloseBlocked(true);
      return;
    }
    closeInFlight.current = true;
    try {
      if (unsaved) await provider?.requestDurability();
      await finishClose();
    } catch {
      setCloseBlocked(true);
    } finally {
      closeInFlight.current = false;
    }
  };
  const exportUnsavedMemo = async () => {
    try {
      const url = URL.createObjectURL(new Blob([await currentMarkdown()], { type: 'text/markdown' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${displayName || 'memo'}.md`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch {
      notify(t('memo.unsavedClose.exportFailed'), 'error');
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
    saveStatus: lifecycle.kind === 'active' ? lifecycle.save : undefined,
    synced,
    isAuthenticated,
    isReadOnly,
    memberCount,
    connectedUsers,
    isContribution,
    hasDeletePrivileges,
    onDelete: handleRequestDelete,
    contentUpdatePolicy: memo?.contentUpdatePolicy,
    hasOwner: !!memo?.createdBy?.profile,
    myMembershipStatus,
  });
  const footerStatusLabel = footerProps.saveStatus
    ? t(`memo.footer.${footerProps.saveStatus}` as const)
    : footerProps.connectionStatus === 'connected'
      ? t('memo.footer.saved')
      : footerProps.connectionStatus === 'connecting'
        ? t('memo.footer.connecting')
        : t('memo.footer.disconnected');

  // The connection-loading overlay below blocks interaction until the provider
  // is `connected` AND the initial sync packet has arrived. By the time the
  // overlay disappears, the editor is built with the final disabled state
  // (permission-driven only), so it does not need to rebuild mid-session.
  // Once the document has synced, transient transport loss keeps the same local
  // Y.Doc mounted and editable; the provider converges it on its next ordinary dial.
  const isConnectionReady = synced;
  const editorDisabled = isReadOnly || !hasContributePrivileges;

  const title = (
    <MemoDisplayName
      displayName={displayName}
      value={displayNameDraft}
      readOnly={!canEditDisplayName}
      editing={editingDisplayName}
      saving={savingDisplayName}
      onChange={setDisplayNameDraft}
      onEdit={handleStartEdit}
      onSave={handleSaveDisplayName}
      onCancel={handleCancelEdit}
    />
  );

  const showLoadingState = loading || !memo || !ydoc || !provider;

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
            statusLabel={footerStatusLabel}
            saveErrorLabel={lastSaveError ? t('memo.footer.saveFailed') : undefined}
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
            {/* The collaborative editor is only mounted once the unified collab
                provider is fully connected and the initial Yjs sync has
                completed. Mounting earlier produces an editor instance that
                attaches to an empty/partial ydoc, which Tiptap then has to
                rebuild on the next render — and the rebuild race is what
                made just-created memos appear stuck on the first 1–3 opens
                (toolbar visible, typing ignored). Holding the mount means
                the editor's first render is its final render, with
                `disabled` driven purely by permissions. Mirrors the MUI
                memo dialog's "Connecting to collaboration service…" overlay. */}
            {isConnectionReady ? (
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
      <ConfirmationDialog
        open={closeBlocked}
        onOpenChange={setCloseBlocked}
        variant="discard"
        title={t('memo.unsavedClose.title')}
        description={t('memo.unsavedClose.description')}
        saveLabel={t('memo.unsavedClose.wait')}
        discardLabel={t('memo.unsavedClose.discard')}
        cancelLabel={t('memo.unsavedClose.export')}
        onSave={() => setCloseBlocked(false)}
        onDiscard={onClose}
        onCancel={() => void exportUnsavedMemo()}
      />
    </>
  );
}

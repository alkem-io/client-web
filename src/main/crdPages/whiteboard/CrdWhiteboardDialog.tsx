import type { ExportedDataState } from '@excalidraw-yjs/excalidraw/data/types';
import type { AssetPublishReport, ExcalidrawImperativeAPI } from '@excalidraw-yjs/excalidraw/types';
import { Formik } from 'formik';
import type { FormikProps } from 'formik/dist/types';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { AuthorizationPrivilege, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import {
  type CommunityMembershipStatus,
  SpaceLevel,
  WhiteboardPreviewMode,
} from '@/core/apollo/generated/graphql-schema';
import { useApolloCache } from '@/core/apollo/utils/evictFromCache';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { error as logError, error as logPreviewError, TagCategoryValues } from '@/core/logging/sentry/log';
import { useRegisterFullscreenEditor } from '@/core/ui/fullscreen/FullscreenEditorContext';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { Identifiable } from '@/core/utils/Identifiable';
import { toBlobPromise } from '@/core/utils/images/toBlobPromise';
import { Loading } from '@/crd/components/common/Loading';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { PreviewCropDialog } from '@/crd/components/whiteboard/PreviewCropDialog';
import { PreviewSettingsDialog } from '@/crd/components/whiteboard/PreviewSettingsDialog';
import { WhiteboardCollabFooter } from '@/crd/components/whiteboard/WhiteboardCollabFooter';
import { WhiteboardDisconnectedDialog } from '@/crd/components/whiteboard/WhiteboardDisconnectedDialog';
import { WhiteboardDisplayName } from '@/crd/components/whiteboard/WhiteboardDisplayName';
import { WhiteboardEditorShell } from '@/crd/components/whiteboard/WhiteboardEditorShell';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { loadWhiteboardSceneFromCollaboration } from '@/domain/collaboration/whiteboard/utils/loadWhiteboardSceneFromCollaboration';
import mergeWhiteboard from '@/domain/collaboration/whiteboard/utils/mergeWhiteboard';
import whiteboardValidationSchema, {
  type WhiteboardFormSchema,
} from '@/domain/collaboration/whiteboard/validation/whiteboardFormSchema';
import useUpdateWhiteboardPreviewSettings from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/useUpdateWhiteboardPreviewSettings';
import {
  DefaultWhiteboardPreviewSettings,
  type WhiteboardPreviewSettings,
} from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import createFallbackWhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardVisuals/createFallbackWhiteboardPreview';
import getWhiteboardPreviewImage from '@/domain/collaboration/whiteboard/WhiteboardVisuals/getWhiteboardPreviewImage';
import useGenerateWhiteboardVisuals from '@/domain/collaboration/whiteboard/WhiteboardVisuals/useGenerateWhiteboardVisuals';
import type {
  PreviewImageDimensions,
  WhiteboardPreviewImage,
} from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { WhiteboardPreviewVisualDimensions } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardVisualsDimensions';
import { useWhiteboardAssetAdapter } from '@/domain/common/whiteboard/excalidraw/assetAdapter/useWhiteboardAssetAdapter';
import CollaborativeExcalidrawWrapper from '@/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper';
import type { CollabAPI, CollabState } from '@/domain/common/whiteboard/excalidraw/collab/useCollab';
import { handleExcalidrawEscape } from '@/domain/common/whiteboard/excalidraw/excalidrawEscape';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { WhiteboardAssistantRailConnector } from './WhiteboardAssistantRailConnector';
import { WhiteboardTemplatePickerButton } from './WhiteboardTemplatePickerButton';
import { mapWhiteboardFooterProps } from './whiteboardFooterMapper';

export interface WhiteboardDetails {
  id: string;
  nameID: string;
  guestContributionsAllowed?: boolean;
  contentUpdatePolicy?: ContentUpdatePolicy;
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
    credentialRules?: Array<{
      name?: string | null;
      grantedPrivileges: AuthorizationPrivilege[];
    }>;
  };
  profile: {
    id: string;
    displayName: string;
    storageBucket: {
      id: string;
      allowedMimeTypes: string[];
      maxFileSize: number;
    };
    visual?: Identifiable & PreviewImageDimensions;
    preview?: Identifiable & PreviewImageDimensions;
    url?: string;
  };
  createdBy?: {
    id: string;
    profile?: {
      displayName: string;
      url: string;
      avatar?: { id: string; uri: string };
    };
  };
  previewSettings: WhiteboardPreviewSettings;
}

interface CrdWhiteboardDialogProps {
  entities: {
    whiteboard: WhiteboardDetails | undefined;
  };
  lastSuccessfulSavedDate: Date | undefined;
  actions: {
    onCancel: () => void;
    onUpdate: (
      whiteboard: WhiteboardDetails,
      previewImages?: WhiteboardPreviewImage[]
    ) => Promise<{ success: boolean; errors?: string[] }>;
    onChangeDisplayName: (whiteboardId: string | undefined, newDisplayName: string) => Promise<void>;
    onDelete: (whiteboard: Identifiable) => Promise<void>;
    setLastSuccessfulSavedDate: (date: Date) => void;
    setConsecutiveSaveErrors: React.Dispatch<React.SetStateAction<number>>;
    onClosePreviewSettingsDialog?: () => void;
  };
  options: {
    show: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    headerActions?: (state: CollabState) => ReactNode;
    dialogTitle: ReactNode;
    fullscreen?: boolean;
    allowFilesAttached?: boolean;
    readOnlyDisplayName?: boolean;
    editDisplayName?: boolean;
    previewSettingsDialogOpen?: boolean;
  };
  state?: {
    loadingWhiteboardValue?: boolean;
    changingWhiteboardLockState?: boolean;
  };
}

type RelevantExcalidrawState = Pick<ExportedDataState, 'appState' | 'elements' | 'files'>;

type CollaborativeCloseParams = {
  /** The live editor API, or `null` when the editor is already gone / unmounted. */
  excalidrawAPI: Pick<ExcalidrawImperativeAPI, 'flushAssetPublication'> | null;
  /** Persist preview + display name for the collaborative whiteboard (a no-op when not editing). */
  /** Return false when the metadata/preview save failed and the dialog must stay open. */
  save: () => Promise<boolean | void>;
  /** Report that one or more images failed to publish (a non-empty `failed`). */
  onPublishFailed: (report: AssetPublishReport) => void;
  /** Tear the collaborative session down: evict the cache + run the parent cancel, which unmounts the provider. */
  teardown: () => void;
  /**
   * Whether the editor generation captured at close-start was DISCARDED while the flush was
   * awaited (a server update-rejected, e.g. triggered BY the flush's locator write, remounted
   * the editor). Checked AFTER the flush, BEFORE the save: if it changed, the captured api and
   * its scene are dead and stale relative to the recovery's server-canonical resync, so the
   * save is aborted rather than clobbering the recovered state.
   */
  hasEditorChanged?: () => boolean;
};

/**
 * Gate the collaborative whiteboard close on asset publication.
 *
 * The collaborative session persists through the Yjs provider, so any image the
 * local user just added must have its opaque locator committed to the shared doc
 * BEFORE the provider / socket is torn down. `flushAssetPublication()` publishes the
 * pending stores and reports the outcome; a non-empty `failed` means an image did
 * NOT persist — the saved content would reference bytes no peer can resolve — so we
 * must NOT report a clean close. We surface the failure and leave the session up
 * instead of tearing it down.
 *
 * Order is load-bearing: the flush is awaited FIRST and the teardown runs ONLY on a
 * clean report. If the editor is already gone there is nothing to flush.
 *
 * @returns `true` when the close proceeded (saved + torn down), `false` when a failed
 *          publish blocked it.
 */
export async function closeCollaborativeWhiteboard({
  excalidrawAPI,
  save,
  onPublishFailed,
  teardown,
  hasEditorChanged,
}: CollaborativeCloseParams): Promise<boolean> {
  if (excalidrawAPI) {
    const report = await excalidrawAPI.flushAssetPublication();
    if (report.failed.length > 0) {
      onPublishFailed(report);
      return false;
    }
  }
  // A recovery (update-rejected) that fired DURING the flush replaced the editor: the
  // captured api is dead and its scene is stale versus the recovery's server-canonical
  // resync. Abort BEFORE the save — never read/persist the dead api, and leave the
  // (recovered) session up rather than tearing it down on this stale intent.
  if (hasEditorChanged?.()) {
    return false;
  }
  const saved = await save();
  if (saved === false) {
    return false;
  }
  teardown();
  return true;
}

const CrdWhiteboardDialog = ({
  entities,
  actions,
  options,
  state,
  lastSuccessfulSavedDate,
}: CrdWhiteboardDialogProps) => {
  const { t } = useTranslation();
  const { t: tWb } = useTranslation('crd-whiteboard');
  const notify = useNotification();
  const { evictFromCache } = useApolloCache();
  const { whiteboard } = entities;
  useRegisterFullscreenEditor(options.show);
  const { isAuthenticated } = useAuthenticationContext();
  const { spaceLevel = SpaceLevel.L0 } = useUrlResolver();
  const { space } = useSpace();
  const { subspace } = useSubSpace();
  const myMembershipStatus =
    spaceLevel === SpaceLevel.L0
      ? space.about.membership?.myMembershipStatus
      : subspace.about.membership?.myMembershipStatus;
  const spaceAboutProfile = spaceLevel === SpaceLevel.L0 ? space.about.profile : subspace.about.profile;

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  // Monotonic editor-generation counter, bumped each time the wrapper discards the editor
  // (server update-rejected). A close-in-flight compares this to detect a recovery that
  // replaced the editor mid-flush and abort the save (see `hasEditorChanged`).
  const editorGenerationRef = useRef(0);
  const collabApiRef = useRef<CollabAPI>(null);
  const editModeEnabled = options.canEdit;

  const [_lastSaveError, setLastSaveError] = useState<string | undefined>();
  const [isSceneInitialized, setSceneInitialized] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedPreviewMode, setSelectedPreviewMode] = useState<WhiteboardPreviewMode>(
    whiteboard?.previewSettings.mode ?? WhiteboardPreviewMode.Auto
  );
  const [loadingPreviewAuto, setLoadingPreviewAuto] = useState(false);
  const [loadingPreviewCrop, setLoadingPreviewCrop] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [previewImageBlob, setPreviewImageBlob] = useState<Blob | undefined>();

  const { assetAdapter, uploadError, resolveError } = useWhiteboardAssetAdapter({
    storageBucketId: whiteboard?.profile?.storageBucket.id ?? '',
  });
  const notifiedUploadError = useRef(uploadError);
  const notifiedResolveError = useRef(resolveError);

  // Surface asset store/resolve failures the way the old files-manager failure state did:
  // a user-visible notification whenever the last error message changes.
  useEffect(() => {
    if (uploadError && uploadError !== notifiedUploadError.current) {
      notifiedUploadError.current = uploadError;
      notify(t('callout.whiteboard.images.uploadFailed'), 'warning');
    }
  }, [uploadError, t, notify]);

  useEffect(() => {
    if (resolveError && resolveError !== notifiedResolveError.current) {
      notifiedResolveError.current = resolveError;
      notify(t('callout.whiteboard.images.downloadFailed'), 'warning');
    }
  }, [resolveError, t, notify]);

  const { generateWhiteboardVisuals } = useGenerateWhiteboardVisuals(excalidrawAPI);
  const { updateWhiteboardPreviewSettings } = useUpdateWhiteboardPreviewSettings({ whiteboard, excalidrawAPI });

  const prepareWhiteboardForUpdate = async (wb: WhiteboardDetails, excState: RelevantExcalidrawState | undefined) => {
    if (!excState || !wb?.profile?.id || !formikRef.current?.isValid) {
      return { success: false as const };
    }
    const previewImages = await generateWhiteboardVisuals(wb);
    const displayName = formikRef.current?.values.profile.displayName ?? wb.profile.displayName;
    return {
      success: true as const,
      whiteboard: { ...wb, profile: { ...wb.profile, displayName } },
      previewImages,
    };
  };

  const onClose = async () => {
    const shouldSave = !!(editModeEnabled && collabApiRef.current?.isCollaborating() && whiteboard);
    // Snapshot the editor generation now; if a recovery (update-rejected) discards it while
    // the flush is awaited, the captured api is dead and the save must abort.
    const generationAtClose = editorGenerationRef.current;
    await closeCollaborativeWhiteboard({
      excalidrawAPI,
      hasEditorChanged: () => editorGenerationRef.current !== generationAtClose,
      save: async () => {
        if (!shouldSave || !whiteboard) return true;
        const excState = excalidrawAPI
          ? {
              elements: excalidrawAPI.getSceneElements(),
              appState: excalidrawAPI.getAppState(),
              files: excalidrawAPI.getFiles(),
            }
          : undefined;
        const result = await prepareWhiteboardForUpdate(whiteboard, excState);
        if (result.success) {
          const update = await actions.onUpdate(result.whiteboard, result.previewImages);
          if (!update.success) {
            notify(t('callout.whiteboard.saveFailed'), 'error');
            return false;
          }
          return true;
        } else {
          logError(new Error('Error preparing whiteboard for update on close'), {
            category: TagCategoryValues.WHITEBOARD,
          });
          notify(t('callout.whiteboard.saveFailed'), 'error');
          return false;
        }
      },
      onPublishFailed: () => {
        notify(t('callout.whiteboard.images.uploadFailed'), 'error');
      },
      teardown: () => {
        evictFromCache(whiteboard?.id, 'Whiteboard');
        actions.onCancel();
      },
    });
  };

  const handleImportTemplate = async (sourceWhiteboardId: string) => {
    if (!excalidrawAPI) return;
    const generationAtImport = editorGenerationRef.current;
    try {
      const templateScene = await loadWhiteboardSceneFromCollaboration(sourceWhiteboardId);
      if (editorGenerationRef.current !== generationAtImport) {
        throw new Error('Whiteboard editor changed while importing template');
      }
      await mergeWhiteboard(
        excalidrawAPI,
        templateScene,
        assetAdapter,
        () => editorGenerationRef.current !== generationAtImport
      );
    } catch (err) {
      notify(t('templateLibrary.whiteboardTemplates.errorImporting'), 'error');
      logError(new Error(`Error importing whiteboard template: '${err}'`), {
        category: TagCategoryValues.WHITEBOARD,
      });
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [learnWhyDialogOpen, setLearnWhyDialogOpen] = useState(false);
  const [learnWhyReasonKey, setLearnWhyReasonKey] = useState<
    'inactivity' | 'multiUserNotAllowed' | 'roomCapacityReached' | 'generic'
  >('generic');
  const [handleDelete, isDeleting] = useLoadingState(async () => {
    if (!whiteboard) return;
    // Close both dialogs BEFORE awaiting the delete: the mutation evicts the whiteboard from the
    // Apollo cache, which triggers re-renders in ancestors (e.g. WhiteboardContributionConnector)
    // whose queries now resolve to `undefined`. Letting those re-renders happen while this dialog
    // is still mounted crashes child hooks that read `whiteboard.profile.*`. Unmounting first
    // avoids that race; if the mutation fails, the global Apollo error handler surfaces it.
    setDeleteDialogOpen(false);
    actions.onCancel();
    await actions.onDelete(whiteboard);
  });

  const formikRef = useRef<FormikProps<WhiteboardFormSchema>>(null);

  const initialValues = {
    profile: { displayName: whiteboard?.profile?.displayName ?? '' },
    previewSettings: whiteboard?.previewSettings ?? DefaultWhiteboardPreviewSettings,
  };

  useEffect(() => {
    formikRef.current?.resetForm({ values: initialValues });
  }, [whiteboard?.id]);

  // Unlike MUI (where the preview-settings dialog is a separate component that reads the persisted
  // mode on mount), this state lives in the parent, which mounts before `whiteboard` has loaded — so
  // the initial value is a stale `Auto`. Re-sync from the persisted mode each time the dialog opens.
  useEffect(() => {
    if (options.previewSettingsDialogOpen) {
      setSelectedPreviewMode(whiteboard?.previewSettings.mode ?? WhiteboardPreviewMode.Auto);
    }
  }, [options.previewSettingsDialogOpen, whiteboard?.previewSettings.mode]);

  if (state?.loadingWhiteboardValue) {
    return <Loading text={tWb('editor.loadingWhiteboard')} />;
  }

  if (!whiteboard) {
    return null;
  }

  return (
    <>
      <CollaborativeExcalidrawWrapper
        entities={{
          whiteboard,
          assetAdapter,
          imageValidation: {
            allowedMimeTypes: whiteboard.profile.storageBucket.allowedMimeTypes,
            maxFileSize: whiteboard.profile.storageBucket.maxFileSize,
          },
          lastSuccessfulSavedDate,
        }}
        collabApiRef={collabApiRef}
        options={{
          UIOptions: { canvasActions: { export: { saveFileToDisk: true } } },
        }}
        actions={{
          onInitApi: setExcalidrawAPI,
          onEditorInvalidated: () => {
            editorGenerationRef.current += 1;
            setExcalidrawAPI(null);
          },
          onRemoteSave: (error?: string) => {
            if (error) {
              setLastSaveError(error);
              actions.setConsecutiveSaveErrors(prev => prev + 1);
            } else {
              actions.setLastSuccessfulSavedDate(new Date());
              setLastSaveError(undefined);
              actions.setConsecutiveSaveErrors(0);
            }
          },
          onSceneInitChange: setSceneInitialized,
        }}
        renderDisconnectNotice={({
          open,
          isOnline,
          connecting,
          hasError,
          terminalCloseReason,
          autoReconnectSeconds,
          lastSuccessfulSavedDate: lastSaved,
          onReconnect,
          onClose: onCloseNotice,
        }) => {
          const isManualRecovery = terminalCloseReason === 'document-size-limit-exceeded';
          const isTerminalUnavailable = terminalCloseReason !== null && !isManualRecovery;

          return (
            <WhiteboardDisconnectedDialog
              open={open}
              onClose={onCloseNotice}
              title={t(
                isTerminalUnavailable
                  ? 'pages.whiteboard.whiteboardDisconnected.unavailableTitle'
                  : 'pages.whiteboard.whiteboardDisconnected.title'
              )}
              message={t(
                isTerminalUnavailable
                  ? 'pages.whiteboard.whiteboardDisconnected.unavailableMessage'
                  : isOnline
                    ? 'pages.whiteboard.whiteboardDisconnected.message'
                    : 'pages.whiteboard.whiteboardDisconnected.offline'
              )}
              lastSavedText={
                lastSaved
                  ? t('pages.whiteboard.whiteboardDisconnected.lastSaved', {
                      lastSaved: formatTimeElapsed(lastSaved, t, 'long'),
                    })
                  : undefined
              }
              canReconnect={!isTerminalUnavailable && isOnline}
              showReconnect={!isTerminalUnavailable}
              reconnecting={connecting}
              countdownSeconds={autoReconnectSeconds}
              onReconnect={onReconnect}
              // Surface the reload escape hatch immediately once a reconnect attempt has failed — while
              // online the countdown cycles `connecting`, so the notice's own stuck-timer never elapses.
              hasError={hasError}
              // Guaranteed escape hatch: a full page reload, independent of `isOnline` / reconnect state.
              // Needed because on a network switch `navigator.onLine` can stay stale for seconds to tens
              // of seconds, disabling Reconnect AND pausing the auto-reconnect countdown (story #10131).
              onReloadPage={isTerminalUnavailable ? undefined : () => window.location.reload()}
            />
          );
        }}
      >
        {({ children, mode, modeReason, collaborating, connecting, restartCollaboration, isReadOnly }) => {
          const { readonlyReason, ...footerProps } = mapWhiteboardFooterProps({
            myPrivileges: whiteboard.authorization?.myPrivileges,
            canEdit: !!options.canEdit,
            preventWhiteboardDeletion: !options.canDelete,
            collaboratorMode: mode,
            collaboratorModeReason: modeReason,
            guestContributionsAllowed: whiteboard.guestContributionsAllowed,
            isAuthenticated,
            contentUpdatePolicy: whiteboard.contentUpdatePolicy,
            hasOwner: !!whiteboard.createdBy?.profile,
            myMembershipStatus: myMembershipStatus as CommunityMembershipStatus | undefined,
          });

          const readonlyMessage = readonlyReason ? (
            <Trans
              t={tWb}
              i18nKey={`footer.readonlyReason.${readonlyReason}` as const}
              values={{
                spaceLevel: t(`common.space-level.${spaceLevel}`),
                ownerName: whiteboard.createdBy?.profile?.displayName,
              }}
              components={{
                strong: <strong className="font-semibold" />,
                ownerlink: whiteboard.createdBy?.profile ? (
                  // biome-ignore lint/a11y/useAnchorContent: content is injected by <Trans /> at runtime
                  <a href={whiteboard.createdBy.profile.url} className="underline text-primary hover:text-primary/80" />
                ) : (
                  <span />
                ),
                spacelink: spaceAboutProfile?.url ? (
                  <Link
                    to={spaceAboutProfile.url}
                    reloadDocument={true}
                    className="underline text-primary hover:text-primary/80"
                  />
                ) : (
                  <span />
                ),
                signinlink: (
                  // biome-ignore lint/a11y/useAnchorContent: content is injected by <Trans /> at runtime
                  <a
                    href={buildLoginUrl(whiteboard.profile?.url)}
                    className="underline text-primary hover:text-primary/80"
                  />
                ),
                learnwhy: (
                  // biome-ignore lint/a11y/useButtonType: type is fixed below
                  <button
                    type="button"
                    onClick={() => {
                      setLearnWhyReasonKey(modeReason ?? 'generic');
                      setLearnWhyDialogOpen(true);
                    }}
                    className="underline text-primary hover:text-primary/80 bg-transparent border-0 p-0 cursor-pointer"
                  />
                ),
              }}
            />
          ) : undefined;

          return (
            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              onSubmit={() => {}}
              validationSchema={whiteboardValidationSchema}
            >
              {({ values, setFieldValue }) => (
                <WhiteboardEditorShell
                  open={options.show}
                  fullscreen={options.fullscreen}
                  onClose={onClose}
                  // Escape first deselects/cancels in Excalidraw; only closes the dialog when there's nothing to clear.
                  onEscapeKeyDown={event => handleExcalidrawEscape(excalidrawAPI, event)}
                  title={
                    <WhiteboardDisplayName
                      displayName={whiteboard.profile.displayName}
                      value={values.profile.displayName}
                      onChange={name => setFieldValue('profile.displayName', name)}
                      readOnly={options.readOnlyDisplayName}
                      editing={isEditingName}
                      onEdit={() => setIsEditingName(true)}
                      onSave={async () => {
                        await actions.onChangeDisplayName(whiteboard.id, values.profile.displayName);
                        setIsEditingName(false);
                      }}
                      onCancel={() => {
                        setFieldValue('profile.displayName', whiteboard.profile.displayName);
                        setIsEditingName(false);
                      }}
                    />
                  }
                  titleExtra={
                    editModeEnabled && mode === 'write' ? (
                      <WhiteboardTemplatePickerButton disabled={!isSceneInitialized} onImport={handleImportTemplate} />
                    ) : undefined
                  }
                  headerActions={options.headerActions?.({ mode, modeReason, collaborating, connecting, isReadOnly })}
                  rail={<WhiteboardAssistantRailConnector whiteboardId={whiteboard.id} />}
                  footer={
                    <WhiteboardCollabFooter
                      {...footerProps}
                      readonlyMessage={readonlyMessage}
                      onDelete={() => setDeleteDialogOpen(true)}
                      onRestart={restartCollaboration}
                      guestAccessBadge={undefined}
                    />
                  }
                >
                  {children}
                </WhiteboardEditorShell>
              )}
            </Formik>
          );
        }}
      </CollaborativeExcalidrawWrapper>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('pages.whiteboard.delete.confirmationTitle')}
        description={t('pages.whiteboard.delete.confirmationText')}
        confirmLabel={t('buttons.delete')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        variant="destructive"
        loading={isDeleting}
      />

      <Dialog open={learnWhyDialogOpen} onOpenChange={setLearnWhyDialogOpen}>
        <DialogContent className="z-[70]" overlayClassName="z-[70]">
          <DialogHeader>
            <DialogTitle>{tWb('footer.readonlyDialog.title')}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-body whitespace-pre-line text-foreground">
            {tWb(`footer.readonlyDialog.reason.${learnWhyReasonKey}` as const)}
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <PreviewSettingsDialog
        open={!!options.previewSettingsDialogOpen}
        onClose={() => actions.onClosePreviewSettingsDialog?.()}
        selectedMode={selectedPreviewMode}
        loadingAuto={loadingPreviewAuto}
        loadingCrop={loadingPreviewCrop}
        onSelectAuto={async () => {
          setSelectedPreviewMode(WhiteboardPreviewMode.Auto);
          setLoadingPreviewAuto(true);
          try {
            await updateWhiteboardPreviewSettings({ mode: WhiteboardPreviewMode.Auto });
          } finally {
            setLoadingPreviewAuto(false);
          }
          actions.onClosePreviewSettingsDialog?.();
        }}
        onSelectCustom={async () => {
          setSelectedPreviewMode(WhiteboardPreviewMode.Custom);
          if (!excalidrawAPI) return;
          setCropDialogOpen(true);
          const { image, error: imgErr } = await getWhiteboardPreviewImage(excalidrawAPI);
          if (imgErr) {
            logPreviewError(new Error('Error generating whiteboard preview image.'));
          }
          const blob = await toBlobPromise(image).catch(async () =>
            toBlobPromise(await createFallbackWhiteboardPreview())
          );
          setPreviewImageBlob(blob);
        }}
        onSelectFixed={async () => {
          setSelectedPreviewMode(WhiteboardPreviewMode.Fixed);
          if (!excalidrawAPI) return;
          setCropDialogOpen(true);
          const { image, error: imgErr } = await getWhiteboardPreviewImage(excalidrawAPI);
          if (imgErr) {
            logPreviewError(new Error('Error generating whiteboard preview image.'));
          }
          const blob = await toBlobPromise(image).catch(async () =>
            toBlobPromise(await createFallbackWhiteboardPreview())
          );
          setPreviewImageBlob(blob);
        }}
      />

      <PreviewCropDialog
        open={cropDialogOpen}
        onClose={() => {
          setCropDialogOpen(false);
          setPreviewImageBlob(undefined);
          setSelectedPreviewMode(whiteboard.previewSettings.mode ?? WhiteboardPreviewMode.Auto);
        }}
        title={t(`pages.whiteboard.previewSettings.modes.${selectedPreviewMode}.title`)}
        previewImage={previewImageBlob}
        initialCrop={whiteboard.previewSettings.coordinates ?? undefined}
        // Must match the ratio the preview generator crops/validates against
        // (WhiteboardPreviewVisualDimensions, the WHITEBOARD_PREVIEW visual) — not the CARD visual.
        aspectRatio={WhiteboardPreviewVisualDimensions.aspectRatio}
        onCropSave={async crop => {
          setCropDialogOpen(false);
          setLoadingPreviewCrop(true);
          try {
            await updateWhiteboardPreviewSettings({
              mode:
                selectedPreviewMode === WhiteboardPreviewMode.Custom
                  ? WhiteboardPreviewMode.Custom
                  : WhiteboardPreviewMode.Fixed,
              coordinates: crop,
            });
          } finally {
            setLoadingPreviewCrop(false);
            setPreviewImageBlob(undefined);
          }
          actions.onClosePreviewSettingsDialog?.();
        }}
      />
    </>
  );
};

export default CrdWhiteboardDialog;

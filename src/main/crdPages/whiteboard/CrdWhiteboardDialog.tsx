import type { ExportedDataState } from '@excalidraw-yjs/excalidraw/data/types';
import type { ExcalidrawImperativeAPI } from '@excalidraw-yjs/excalidraw/types';
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
import { WhiteboardDisplayName } from '@/crd/components/whiteboard/WhiteboardDisplayName';
import { WhiteboardEditorShell } from '@/crd/components/whiteboard/WhiteboardEditorShell';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import type { CollaborationState } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
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
import CollaborativeExcalidrawWrapper, {
  type CollabAPI,
} from '@/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper';
import { CollaboratorModeReasons } from '@/domain/common/whiteboard/excalidraw/collab/excalidrawAppConstants';
import { handleExcalidrawEscape } from '@/domain/common/whiteboard/excalidraw/excalidrawEscape';
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
    headerActions?: (state: CollaborationState) => ReactNode;
    dialogTitle: ReactNode;
    fullscreen?: boolean;
    allowFilesAttached?: boolean;
    readOnlyDisplayName?: boolean;
    editDisplayName?: boolean;
    previewSettingsDialogOpen?: boolean;
    /** Draft editors may close only after the collaboration service confirms persistence. */
    requireDurableClose?: boolean;
  };
  state?: {
    loadingWhiteboardValue?: boolean;
    changingWhiteboardLockState?: boolean;
  };
}

type RelevantExcalidrawState = Pick<ExportedDataState, 'appState' | 'elements' | 'files'>;

type CollaborativeCloseParams = {
  /** Persist preview + display name; content persists through the provider below. */
  save: () => Promise<boolean | undefined>;
  /** Join the provider's one save owner. It publishes assets before its barrier. */
  requestDurability?: () => Promise<void>;
  requireDurability?: boolean;
  onDurabilityFailed?: () => void;
  teardown: () => void;
};

export const acceptWhiteboardCloseIntent = ({
  hasUnsaved,
  canPersist,
  abortImport,
}: {
  hasUnsaved: boolean;
  canPersist: boolean;
  abortImport: () => void;
}) => {
  if (hasUnsaved && !canPersist) return false;
  abortImport();
  return true;
};

/** Close only after metadata and the provider's continuous save owner settle. */
export async function closeCollaborativeWhiteboard({
  save,
  requestDurability,
  requireDurability,
  onDurabilityFailed,
  teardown,
}: CollaborativeCloseParams): Promise<boolean> {
  if ((await save()) === false) return false;
  if (!requestDurability && requireDurability) {
    onDurabilityFailed?.();
    return false;
  }
  if (requestDurability) {
    try {
      await requestDurability();
    } catch {
      onDurabilityFailed?.();
      return false;
    }
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
  const editorLeaseRef = useRef<{ api: ExcalidrawImperativeAPI; whiteboardId: string } | null>(null);
  const importInFlightRef = useRef<Promise<void> | null>(null);
  const importAbortRef = useRef<AbortController | null>(null);
  const closeInFlightRef = useRef(false);
  const [closeBlocked, setCloseBlocked] = useState(false);
  const collabApiRef = useRef<CollabAPI>(null);
  const editModeEnabled = options.canEdit;

  useEffect(() => () => importAbortRef.current?.abort(), [whiteboard?.id]);

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
    if (closeInFlightRef.current) return;
    closeInFlightRef.current = true;
    const collabApi = collabApiRef.current;
    const lifecycle = collabApi?.getState();
    const hasUnsaved = !!collabApi?.hasUnsavedChanges();
    const canPersist = !!(lifecycle?.kind === 'active' && lifecycle.access === 'write' && lifecycle.save !== 'offline');
    if (
      !acceptWhiteboardCloseIntent({
        hasUnsaved,
        canPersist,
        abortImport: () => importAbortRef.current?.abort(),
      })
    ) {
      setCloseBlocked(true);
      closeInFlightRef.current = false;
      return;
    }
    const shouldSave = !!(
      editModeEnabled &&
      lifecycle?.kind === 'active' &&
      lifecycle.access === 'write' &&
      whiteboard
    );
    try {
      await closeCollaborativeWhiteboard({
        requestDurability: shouldSave && collabApi ? () => collabApi.requestDurability() : undefined,
        requireDurability: options.requireDurableClose,
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
        onDurabilityFailed: () => {
          setCloseBlocked(true);
          notify(t('callout.whiteboard.saveFailed'), 'error');
        },
        teardown: () => {
          evictFromCache(whiteboard?.id, 'Whiteboard');
          actions.onCancel();
        },
      });
    } finally {
      closeInFlightRef.current = false;
    }
  };

  const exportUnsavedWhiteboard = async () => {
    if (!excalidrawAPI || !whiteboard) return;
    try {
      const { serializeAsJSON } = await import('@excalidraw-yjs/excalidraw');
      const json = serializeAsJSON(
        excalidrawAPI.getSceneElements(),
        excalidrawAPI.getAppState(),
        excalidrawAPI.getFiles(),
        'local'
      );
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${whiteboard.profile.displayName || 'whiteboard'}.excalidraw`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch {
      notify(t('callout.whiteboard.saveFailed'), 'error');
    }
  };

  const handleImportTemplate = (sourceWhiteboardId: string): Promise<void> => {
    const targetLease = editorLeaseRef.current;
    const whiteboardId = whiteboard?.id;
    if (
      !excalidrawAPI ||
      !targetLease ||
      targetLease.api !== excalidrawAPI ||
      targetLease.whiteboardId !== whiteboardId
    ) {
      return Promise.resolve();
    }
    if (importInFlightRef.current) return importInFlightRef.current;

    const controller = new AbortController();
    importAbortRef.current = controller;
    const operation = (async () => {
      try {
        const templateScene = await loadWhiteboardSceneFromCollaboration(sourceWhiteboardId, {
          signal: controller.signal,
        });
        await mergeWhiteboard(excalidrawAPI, templateScene, assetAdapter, {
          signal: controller.signal,
          targetLeaseValid: () => editorLeaseRef.current === targetLease && !closeInFlightRef.current,
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        notify(t('templateLibrary.whiteboardTemplates.errorImporting'), 'error');
        logError(new Error(`Error importing whiteboard template: '${err}'`), {
          category: TagCategoryValues.WHITEBOARD,
        });
      }
    })();
    importInFlightRef.current = operation;
    void operation.finally(() => {
      if (importInFlightRef.current === operation) importInFlightRef.current = null;
      if (importAbortRef.current === controller) importAbortRef.current = null;
    });
    return operation;
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
          onInitApi: (api, whiteboardId) => {
            if (api) {
              editorLeaseRef.current = { api, whiteboardId };
              setExcalidrawAPI(api);
            } else if (editorLeaseRef.current?.whiteboardId === whiteboardId) {
              editorLeaseRef.current = null;
              setExcalidrawAPI(null);
              importAbortRef.current?.abort();
            }
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
          onSceneInitChange: initialized => {
            setSceneInitialized(initialized);
            if (!initialized) importAbortRef.current?.abort();
          },
        }}
      >
        {({ children, lifecycle, readOnlyReason }) => {
          const active = lifecycle.kind === 'active';
          const mode = active ? lifecycle.access : null;
          const modeReason =
            readOnlyReason === 'roomCapacityReached'
              ? CollaboratorModeReasons.ROOM_CAPACITY_REACHED
              : readOnlyReason === 'multiUserNotAllowed'
                ? CollaboratorModeReasons.MULTI_USER_NOT_ALLOWED
                : null;
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
                  headerActions={options.headerActions?.(lifecycle)}
                  rail={<WhiteboardAssistantRailConnector whiteboardId={whiteboard.id} />}
                  footer={
                    <WhiteboardCollabFooter
                      {...footerProps}
                      saveStatus={
                        lifecycle.kind === 'active' ? lifecycle.save : lifecycle.kind === 'ended' ? 'ended' : undefined
                      }
                      readonlyMessage={readonlyMessage}
                      onDelete={() => setDeleteDialogOpen(true)}
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
        open={closeBlocked}
        onOpenChange={setCloseBlocked}
        variant="discard"
        title={tWb('editor.unsavedChanges.title')}
        description={tWb('editor.unsavedChanges.description')}
        saveLabel={tWb('editor.unsavedChanges.wait')}
        discardLabel={tWb('editor.unsavedChanges.confirm')}
        cancelLabel={tWb('editor.unsavedChanges.export')}
        onSave={() => setCloseBlocked(false)}
        onDiscard={() => {
          evictFromCache(whiteboard.id, 'Whiteboard');
          actions.onCancel();
        }}
        onCancel={() => void exportUnsavedWhiteboard()}
      />

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

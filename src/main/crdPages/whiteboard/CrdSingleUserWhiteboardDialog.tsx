import type { ExcalidrawImperativeAPI } from '@excalidraw-yjs/excalidraw/dist/types/excalidraw/types';
import { Formik } from 'formik';
import type { FormikProps } from 'formik/dist/types';
import { toBase64 } from 'lib0/buffer';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Y from 'yjs';
import type { AuthorizationPrivilege, VisualType } from '@/core/apollo/generated/graphql-schema';
import { WhiteboardPreviewMode } from '@/core/apollo/generated/graphql-schema';
import { error as logError, warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { useRegisterFullscreenEditor } from '@/core/ui/fullscreen/FullscreenEditorContext';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { Identifiable } from '@/core/utils/Identifiable';
import { toBlobPromise } from '@/core/utils/images/toBlobPromise';
import { Loading } from '@/crd/components/common/Loading';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { PreviewCropDialog } from '@/crd/components/whiteboard/PreviewCropDialog';
import { PreviewSettingsDialog } from '@/crd/components/whiteboard/PreviewSettingsDialog';
import { WhiteboardEditorShell } from '@/crd/components/whiteboard/WhiteboardEditorShell';
import { WhiteboardSaveFooter } from '@/crd/components/whiteboard/WhiteboardSaveFooter';
import mergeWhiteboard from '@/domain/collaboration/whiteboard/utils/mergeWhiteboard';
import whiteboardValidationSchema from '@/domain/collaboration/whiteboard/validation/whiteboardFormSchema';
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
import { SEED_ORIGIN } from '@/domain/common/whiteboard/excalidraw/collab/seedOrigin';
import ExcalidrawWrapper from '@/domain/common/whiteboard/excalidraw/ExcalidrawWrapper';
import type { BinaryFileDataWithOptionalUrl } from '@/domain/common/whiteboard/excalidraw/types';
import useWhiteboardFilesManager from '@/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager';
import { WhiteboardTemplatePickerButton } from './WhiteboardTemplatePickerButton';

export interface WhiteboardWithContent {
  id: string;
  nameID: string;
  guestContributionsAllowed?: boolean;
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
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
    profile?: { displayName: string; url: string; avatar?: { id: string; uri: string } };
  };
  previewSettings: WhiteboardPreviewSettings;
  content: string;
}

type CrdSingleUserWhiteboardDialogProps = {
  entities: {
    whiteboard: WhiteboardWithContent;
  };
  actions: {
    onCancel: () => void;
    onUpdate: (whiteboard: WhiteboardWithContent, previewImages?: WhiteboardPreviewImage[]) => Promise<void>;
    onUpdatePreviewSettings?: (previewSettings: WhiteboardPreviewSettings) => Promise<unknown>;
    onDelete?: (whiteboard: Identifiable) => Promise<void>;
    onClosePreviewSettingsDialog?: () => void;
  };
  options: {
    show: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    headerActions?: ReactNode;
    dialogTitle?: ReactNode;
    fullscreen?: boolean;
    allowFilesAttached?: boolean;
    previewSettingsDialogOpen?: boolean;
    previewImagesSettings?: { visualType: VisualType; dimensions: PreviewImageDimensions }[];
  };
  state?: {
    updatingWhiteboard?: boolean;
    loadingWhiteboardContent?: boolean;
    changingWhiteboardLockState?: boolean;
  };
};

const CrdSingleUserWhiteboardDialog = ({ entities, actions, options, state }: CrdSingleUserWhiteboardDialogProps) => {
  const { t } = useTranslation();
  const { t: tWb } = useTranslation('crd-whiteboard');
  const notify = useNotification();
  const { whiteboard } = entities;
  useRegisterFullscreenEditor(options.show);
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  // The editor's live `Scene.doc` (handed up by ExcalidrawWrapper via getSceneDoc) is
  // the single in-memory representation; on save it is encoded straight to a Yjs-V2
  // update (no snapshot/object materialization).
  const localDocRef = useRef<Y.Doc | null>(null);
  // Native-Yjs dirty flag: flipped by any doc `update` whose origin is NOT the load
  // seed (`SEED_ORIGIN`) — i.e. a genuine user edit. Replaces the snapshot-hash compare;
  // the doc never has to be materialized to decide dirtiness.
  const dirtyRef = useRef(false);
  // Detacher for the doc `update` listener attached in `onInitDoc`, run on unmount.
  const detachDirtyListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      detachDirtyListenerRef.current?.();
      detachDirtyListenerRef.current = null;
    };
  }, []);
  const { generateWhiteboardVisuals } = useGenerateWhiteboardVisuals(excalidrawAPI);
  const [pendingClose, setPendingClose] = useState<{ resolve: (discard: boolean) => void } | null>(null);
  const [selectedPreviewMode, setSelectedPreviewMode] = useState<WhiteboardPreviewMode>(
    whiteboard.previewSettings.mode ?? WhiteboardPreviewMode.Auto
  );
  const [loadingPreviewAuto, setLoadingPreviewAuto] = useState(false);
  const [loadingPreviewCrop, setLoadingPreviewCrop] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [previewImageBlob, setPreviewImageBlob] = useState<Blob | undefined>();

  const openCropDialogWithPreview = async () => {
    if (!excalidrawAPI) return;
    setCropDialogOpen(true);
    const { image, error: imgErr } = await getWhiteboardPreviewImage(excalidrawAPI);
    if (imgErr) {
      logError(new Error('Error generating whiteboard preview image.'), {
        category: TagCategoryValues.WHITEBOARD,
      });
    }
    const blob = await toBlobPromise(image).catch(async () => toBlobPromise(await createFallbackWhiteboardPreview()));
    setPreviewImageBlob(blob);
  };

  const filesManager = useWhiteboardFilesManager({
    excalidrawAPI,
    storageBucketId: whiteboard.profile?.storageBucket.id ?? '',
    allowedMimeTypes: whiteboard.profile?.storageBucket.allowedMimeTypes,
    maxFileSize: whiteboard.profile?.storageBucket.maxFileSize,
    allowFallbackToAttached: options.allowFilesAttached,
  });

  const failureState = filesManager.getFailureState();

  useEffect(() => {
    if (failureState.hasFailures) {
      const totalFailures = failureState.uploadFailures.length + failureState.downloadFailures.length;
      const message =
        totalFailures === 1
          ? t('callout.whiteboard.images.singleFailure')
          : t('callout.whiteboard.images.multipleFailures', { count: totalFailures });
      notify(message, 'warning');
    }
  }, [failureState.hasFailures, failureState.uploadFailures.length, failureState.downloadFailures.length, t, notify]);

  // Keep the selected mode in sync with the persisted settings each time the dialog opens — the
  // state initializer can capture a stale `Auto` if `whiteboard` populates after this mounts.
  useEffect(() => {
    if (options.previewSettingsDialogOpen) {
      setSelectedPreviewMode(whiteboard.previewSettings.mode ?? WhiteboardPreviewMode.Auto);
    }
  }, [options.previewSettingsDialogOpen, whiteboard.previewSettings.mode]);

  const handleUpdate = async (wb: WhiteboardWithContent) => {
    const doc = localDocRef.current;
    if (!doc || !excalidrawAPI) return;
    // Native-Yjs save: the editor's live `Scene.doc` IS the content — the element
    // model is NEVER materialized into a scene object. Before encoding, re-home only
    // the embedded local file BLOBS: read the editor's files (`getFiles()`), run the
    // files-only local→remote conversion (which UPLOADS each local blob to the
    // document's storage bucket and returns the records, consuming ONLY `.files`,
    // never elements), and push the re-homed records back via `addFiles`. The files
    // map is full `BinaryFileData` at runtime; the element package types it loosely,
    // so coerce at the boundary.
    const files = excalidrawAPI.getFiles() as unknown as Record<string, BinaryFileDataWithOptionalUrl>;
    const {
      whiteboard: { files: rehomedFiles },
      unrecoverableFiles,
    } = await filesManager.convertLocalFilesToRemoteInWhiteboard({ files });

    if (rehomedFiles && Object.keys(rehomedFiles).length > 0) {
      excalidrawAPI.addFiles(Object.values(rehomedFiles));
    }

    if (unrecoverableFiles.length > 0) {
      logWarn(`Whiteboard save: ${unrecoverableFiles.length} files could not be saved`, {
        category: TagCategoryValues.WHITEBOARD,
      });
    }

    const previewImages = await generateWhiteboardVisuals(wb, true, options.previewImagesSettings);
    // 006 boundary: store the content as a base64-encoded Yjs-V2 update of the live
    // doc (NOT Excalidraw JSON — the server rejects JSON with error 12101). The element
    // model never materializes into an object on the way out.
    const content = toBase64(Y.encodeStateAsUpdateV2(doc));

    return actions.onUpdate({ ...wb, content }, previewImages);
  };

  const handleSave = async () => {
    formikRef.current?.setTouched({ profile: { displayName: true } }, true);
    await handleUpdate(whiteboard);
  };

  const onClose = async () => {
    if (options.canEdit) {
      // Native-Yjs dirty-check: `dirtyRef` was flipped by any doc `update` not carrying
      // the load `SEED_ORIGIN` (a genuine edit) — no doc materialization, no hashing.
      if (dirtyRef.current || formikRef.current?.dirty) {
        const discard = await new Promise<boolean>(resolve => {
          setPendingClose({ resolve });
        });
        if (!discard) return;
      }
    }
    actions.onCancel();
  };

  const handleImportTemplate = async (whiteboardContent: string) => {
    if (excalidrawAPI && options.canEdit) {
      try {
        await mergeWhiteboard(excalidrawAPI, whiteboardContent);
      } catch (err) {
        notify(t('templateLibrary.whiteboardTemplates.errorImporting'), 'error');
        logError(new Error(`Error importing whiteboard template: '${err}'`), {
          category: TagCategoryValues.WHITEBOARD,
        });
      }
    }
  };

  const formikRef =
    useRef<
      FormikProps<{
        profile: { displayName: string };
        previewSettings: WhiteboardPreviewSettings;
      }>
    >(null);

  const initialValues = {
    profile: { displayName: whiteboard.profile?.displayName ?? '' },
    previewSettings: whiteboard.previewSettings ?? DefaultWhiteboardPreviewSettings,
  };

  return (
    <>
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        onSubmit={() => {}}
        validationSchema={whiteboardValidationSchema}
      >
        {({ isValid }) => (
          <WhiteboardEditorShell
            open={options.show}
            fullscreen={options.fullscreen}
            onClose={onClose}
            title={options.dialogTitle ?? t('common.Whiteboard')}
            titleExtra={
              options.canEdit ? <WhiteboardTemplatePickerButton onImport={handleImportTemplate} /> : undefined
            }
            headerActions={options.headerActions}
            footer={
              <WhiteboardSaveFooter
                onDelete={actions.onDelete ? () => actions.onDelete?.(whiteboard) : undefined}
                onSave={handleSave}
                saving={state?.changingWhiteboardLockState || state?.updatingWhiteboard}
                saveDisabled={!isValid}
              />
            }
          >
            {!state?.loadingWhiteboardContent && whiteboard && (
              <ExcalidrawWrapper
                entities={{ whiteboard, filesManager }}
                options={{
                  viewModeEnabled: !options.canEdit,
                  UIOptions: {
                    canvasActions: {
                      export: options.canEdit ? { saveFileToDisk: true } : false,
                    },
                  },
                }}
                actions={{
                  onUpdate: () => handleUpdate(whiteboard),
                  onInitApi: setExcalidrawAPI,
                  onInitDoc: doc => {
                    localDocRef.current = doc;
                    // Detach any prior listener (e.g. a remount), reset, then track edits.
                    // The load seed applies with `SEED_ORIGIN`, so it does NOT mark dirty;
                    // only user-originated updates do.
                    detachDirtyListenerRef.current?.();
                    dirtyRef.current = false;
                    const onDocUpdate = (_update: Uint8Array, origin: unknown) => {
                      if (origin !== SEED_ORIGIN) {
                        dirtyRef.current = true;
                      }
                    };
                    doc.on('update', onDocUpdate);
                    detachDirtyListenerRef.current = () => doc.off('update', onDocUpdate);
                  },
                }}
              />
            )}
            {state?.loadingWhiteboardContent && <Loading text={tWb('editor.loadingWhiteboard')} />}
          </WhiteboardEditorShell>
        )}
      </Formik>

      <ConfirmationDialog
        open={pendingClose !== null}
        onOpenChange={open => {
          if (!open && pendingClose) {
            pendingClose.resolve(false);
            setPendingClose(null);
          }
        }}
        title={tWb('editor.unsavedChanges.title')}
        description={tWb('editor.unsavedChanges.description')}
        confirmLabel={tWb('editor.unsavedChanges.confirm')}
        cancelLabel={tWb('editor.unsavedChanges.cancel')}
        variant="destructive"
        onConfirm={() => {
          pendingClose?.resolve(true);
          setPendingClose(null);
        }}
        onCancel={() => {
          pendingClose?.resolve(false);
          setPendingClose(null);
        }}
      />

      {actions.onUpdatePreviewSettings && (
        <>
          <PreviewSettingsDialog
            open={!!options.previewSettingsDialogOpen}
            onClose={() => actions.onClosePreviewSettingsDialog?.()}
            selectedMode={selectedPreviewMode}
            loadingAuto={loadingPreviewAuto}
            loadingCrop={loadingPreviewCrop}
            onSelectAuto={async () => {
              setSelectedPreviewMode(WhiteboardPreviewMode.Auto);
              if (whiteboard.previewSettings.mode !== WhiteboardPreviewMode.Auto) {
                setLoadingPreviewAuto(true);
                try {
                  await actions.onUpdatePreviewSettings?.({ mode: WhiteboardPreviewMode.Auto });
                } finally {
                  setLoadingPreviewAuto(false);
                }
              }
              actions.onClosePreviewSettingsDialog?.();
            }}
            onSelectCustom={async () => {
              setSelectedPreviewMode(WhiteboardPreviewMode.Custom);
              await openCropDialogWithPreview();
            }}
            onSelectFixed={async () => {
              setSelectedPreviewMode(WhiteboardPreviewMode.Fixed);
              await openCropDialogWithPreview();
            }}
          />

          <PreviewCropDialog
            open={cropDialogOpen}
            onClose={() => {
              setCropDialogOpen(false);
              setPreviewImageBlob(undefined);
              setSelectedPreviewMode(whiteboard.previewSettings.mode ?? WhiteboardPreviewMode.Auto);
            }}
            title={tWb(`preview.modes.${selectedPreviewMode}.title`)}
            previewImage={previewImageBlob}
            initialCrop={whiteboard.previewSettings.coordinates ?? undefined}
            aspectRatio={
              options.previewImagesSettings?.[0]?.dimensions.aspectRatio ??
              WhiteboardPreviewVisualDimensions.aspectRatio
            }
            onCropSave={async crop => {
              setCropDialogOpen(false);
              setLoadingPreviewCrop(true);
              try {
                await actions.onUpdatePreviewSettings?.({
                  mode: selectedPreviewMode,
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
      )}
    </>
  );
};

export default CrdSingleUserWhiteboardDialog;

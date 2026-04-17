import type { serializeAsJSON as ExcalidrawSerializeAsJSON } from '@alkemio/excalidraw';
import type { ExportedDataState } from '@alkemio/excalidraw/dist/types/excalidraw/data/types';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { Formik } from 'formik';
import type { FormikProps } from 'formik/dist/types';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AuthorizationPrivilege, VisualType } from '@/core/apollo/generated/graphql-schema';
import { WhiteboardPreviewMode } from '@/core/apollo/generated/graphql-schema';
import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { error as logError, warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { Identifiable } from '@/core/utils/Identifiable';
import { toBlobPromise } from '@/core/utils/images/toBlobPromise';
import { Loading } from '@/crd/components/common/Loading';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { PreviewCropDialog } from '@/crd/components/whiteboard/PreviewCropDialog';
import { PreviewSettingsDialog } from '@/crd/components/whiteboard/PreviewSettingsDialog';
import { WhiteboardEditorShell } from '@/crd/components/whiteboard/WhiteboardEditorShell';
import { WhiteboardSaveFooter } from '@/crd/components/whiteboard/WhiteboardSaveFooter';
import isWhiteboardContentEqual from '@/domain/collaboration/whiteboard/utils/isWhiteboardContentEqual';
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
import ExcalidrawWrapper from '@/domain/common/whiteboard/excalidraw/ExcalidrawWrapper';
import useWhiteboardFilesManager from '@/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager';
import WhiteboardDialogTemplatesLibrary from '@/domain/templates/components/WhiteboardDialog/WhiteboardDialogTemplatesLibrary';
import type { WhiteboardTemplateContent } from '@/domain/templates/models/WhiteboardTemplate';

type ExcalidrawUtils = {
  serializeAsJSON: typeof ExcalidrawSerializeAsJSON;
};

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

type RelevantExcalidrawState = Pick<ExportedDataState, 'appState' | 'elements' | 'files'>;

const CrdSingleUserWhiteboardDialog = ({ entities, actions, options, state }: CrdSingleUserWhiteboardDialogProps) => {
  const { t } = useTranslation();
  const { t: tWb } = useTranslation('crd-whiteboard');
  const notify = useNotification();
  const { whiteboard } = entities;
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
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

  const getExcalidrawState = () => {
    if (!excalidrawAPI) return undefined;
    return {
      appState: excalidrawAPI.getAppState(),
      elements: excalidrawAPI.getSceneElements(),
      files: excalidrawAPI.getFiles(),
    };
  };

  const handleUpdate = async (wb: WhiteboardWithContent, excState: RelevantExcalidrawState | undefined) => {
    if (!excState) return;
    const { serializeAsJSON } = await lazyImportWithErrorHandler<ExcalidrawUtils>(() => import('@alkemio/excalidraw'));
    const { whiteboard: convertedState, unrecoverableFiles } =
      await filesManager.convertLocalFilesToRemoteInWhiteboard(excState);

    if (unrecoverableFiles.length > 0) {
      logWarn(`Whiteboard save: ${unrecoverableFiles.length} files could not be saved`, {
        category: TagCategoryValues.WHITEBOARD,
      });
    }

    const { appState, elements, files } = convertedState;
    const previewImages = await generateWhiteboardVisuals(wb, true, options.previewImagesSettings);
    const content = serializeAsJSON(elements, appState, files ?? {}, 'local');

    return actions.onUpdate({ ...wb, content }, previewImages);
  };

  const handleSave = async () => {
    formikRef.current?.setTouched({ profile: { displayName: true } }, true);
    const excState = getExcalidrawState();
    await handleUpdate(whiteboard, excState);
  };

  const onClose = async () => {
    if (excalidrawAPI && options.canEdit) {
      const { serializeAsJSON } = await lazyImportWithErrorHandler<ExcalidrawUtils>(
        () => import('@alkemio/excalidraw')
      );
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();
      const content = serializeAsJSON(elements, appState, files, 'local');

      if (!isWhiteboardContentEqual(whiteboard.content, content) || formikRef.current?.dirty) {
        const discard = await new Promise<boolean>(resolve => {
          setPendingClose({ resolve });
        });
        if (!discard) return;
      }
    }
    actions.onCancel();
  };

  const handleImportTemplate = async (template: WhiteboardTemplateContent) => {
    if (excalidrawAPI && options.canEdit) {
      try {
        await mergeWhiteboard(excalidrawAPI, template.whiteboard.content);
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
              <WhiteboardDialogTemplatesLibrary editModeEnabled={true} onImportTemplate={handleImportTemplate} />
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
                  onUpdate: excState => handleUpdate(whiteboard, excState),
                  onInitApi: setExcalidrawAPI,
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
            aspectRatio={options.previewImagesSettings?.[0]?.dimensions.aspectRatio ?? 16 / 9}
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

import type { ExportedDataState } from '@alkemio/excalidraw/dist/types/excalidraw/data/types';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { Formik } from 'formik';
import type { FormikProps } from 'formik/dist/types';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AuthorizationPrivilege, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { WhiteboardPreviewMode } from '@/core/apollo/generated/graphql-schema';
import { useApolloCache } from '@/core/apollo/utils/removeFromCache';
import { error as logError, error as logPreviewError, TagCategoryValues } from '@/core/logging/sentry/log';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { Identifiable } from '@/core/utils/Identifiable';
import { toBlobPromise } from '@/core/utils/images/toBlobPromise';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { PreviewCropDialog } from '@/crd/components/whiteboard/PreviewCropDialog';
import { PreviewSettingsDialog } from '@/crd/components/whiteboard/PreviewSettingsDialog';
import { WhiteboardCollabFooter } from '@/crd/components/whiteboard/WhiteboardCollabFooter';
import { WhiteboardDisplayName } from '@/crd/components/whiteboard/WhiteboardDisplayName';
import { WhiteboardEditorShell } from '@/crd/components/whiteboard/WhiteboardEditorShell';
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
import CollaborativeExcalidrawWrapper from '@/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper';
import type { CollabAPI, CollabState } from '@/domain/common/whiteboard/excalidraw/collab/useCollab';
import useWhiteboardFilesManager from '@/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import WhiteboardDialogTemplatesLibrary from '@/domain/templates/components/WhiteboardDialog/WhiteboardDialogTemplatesLibrary';
import type { WhiteboardTemplateContent } from '@/domain/templates/models/WhiteboardTemplate';
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

const CrdWhiteboardDialog = ({
  entities,
  actions,
  options,
  state,
  lastSuccessfulSavedDate,
}: CrdWhiteboardDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { evictFromCache } = useApolloCache();
  const { whiteboard } = entities;

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
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

  const filesManager = useWhiteboardFilesManager({
    excalidrawAPI,
    storageBucketId: whiteboard?.profile?.storageBucket.id ?? '',
    allowedMimeTypes: whiteboard?.profile?.storageBucket.allowedMimeTypes,
    maxFileSize: whiteboard?.profile?.storageBucket.maxFileSize,
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

  const { generateWhiteboardVisuals } = useGenerateWhiteboardVisuals(excalidrawAPI);
  const { updateWhiteboardPreviewSettings } = useUpdateWhiteboardPreviewSettings({ whiteboard, excalidrawAPI });

  const prepareWhiteboardForUpdate = async (wb: WhiteboardDetails, excState: RelevantExcalidrawState | undefined) => {
    if (!excState || !wb?.profile?.id || !formikRef.current?.isValid) {
      return { success: false as const };
    }
    const previewImages = !filesManager.loading.downloadingFiles ? await generateWhiteboardVisuals(wb) : undefined;
    const displayName = formikRef.current?.values.profile.displayName ?? wb.profile.displayName;
    return {
      success: true as const,
      whiteboard: { ...wb, profile: { ...wb.profile, displayName } },
      previewImages,
    };
  };

  const onClose = async () => {
    if (editModeEnabled && collabApiRef.current?.isCollaborating() && whiteboard) {
      const excState = excalidrawAPI
        ? {
            elements: excalidrawAPI.getSceneElements(),
            appState: excalidrawAPI.getAppState(),
            files: excalidrawAPI.getFiles(),
          }
        : undefined;
      const result = await prepareWhiteboardForUpdate(whiteboard, excState);
      if (result.success) {
        actions.onUpdate(result.whiteboard, result.previewImages);
      } else {
        logError(new Error('Error preparing whiteboard for update on close'), {
          category: TagCategoryValues.WHITEBOARD,
        });
      }
    }
    evictFromCache(whiteboard?.id, 'Whiteboard');
    actions.onCancel();
  };

  const handleImportTemplate = async (template: WhiteboardTemplateContent) => {
    if (excalidrawAPI) {
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [handleDelete, isDeleting] = useLoadingState(async () => {
    if (whiteboard) {
      setDeleteDialogOpen(false);
      actions.onCancel();
      await actions.onDelete(whiteboard);
    }
  });

  const formikRef = useRef<FormikProps<WhiteboardFormSchema>>(null);

  const initialValues = {
    profile: { displayName: whiteboard?.profile?.displayName ?? '' },
    previewSettings: whiteboard?.previewSettings ?? DefaultWhiteboardPreviewSettings,
  };

  useEffect(() => {
    formikRef.current?.resetForm({ values: initialValues });
  }, [whiteboard?.id]);

  if (state?.loadingWhiteboardValue) {
    return <Loading text="Loading whiteboard..." />;
  }

  if (!whiteboard) {
    return null;
  }

  return (
    <>
      <CollaborativeExcalidrawWrapper
        entities={{ whiteboard, filesManager, lastSuccessfulSavedDate }}
        collabApiRef={collabApiRef}
        options={{
          UIOptions: { canvasActions: { export: { saveFileToDisk: true } } },
        }}
        actions={{
          onInitApi: setExcalidrawAPI,
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
      >
        {({ children, mode, modeReason, collaborating, connecting, restartCollaboration, isReadOnly }) => {
          const footerProps = mapWhiteboardFooterProps({
            myPrivileges: whiteboard.authorization?.myPrivileges,
            canEdit: !!options.canEdit,
            collaboratorMode: mode,
            collaboratorModeReason: modeReason,
            guestContributionsAllowed: whiteboard.guestContributionsAllowed,
            isAuthenticated: true,
            contentUpdatePolicy: whiteboard.contentUpdatePolicy,
          });

          return (
            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              onSubmit={() => {}}
              validationSchema={whiteboardValidationSchema}
            >
              <WhiteboardEditorShell
                open={options.show}
                fullscreen={options.fullscreen}
                onClose={onClose}
                title={
                  <WhiteboardDisplayName
                    displayName={whiteboard.profile.displayName}
                    readOnly={options.readOnlyDisplayName}
                    editing={isEditingName}
                    onEdit={() => setIsEditingName(true)}
                    onSave={async newName => {
                      await actions.onChangeDisplayName(whiteboard.id, newName);
                      setIsEditingName(false);
                    }}
                    onCancel={() => setIsEditingName(false)}
                  />
                }
                titleExtra={
                  <WhiteboardDialogTemplatesLibrary
                    editModeEnabled={!!editModeEnabled && mode === 'write'}
                    disabled={!isSceneInitialized}
                    onImportTemplate={handleImportTemplate}
                  />
                }
                headerActions={options.headerActions?.({ mode, modeReason, collaborating, connecting, isReadOnly })}
                footer={
                  <WhiteboardCollabFooter
                    {...footerProps}
                    onDelete={() => setDeleteDialogOpen(true)}
                    onRestart={restartCollaboration}
                    guestAccessBadge={undefined}
                  />
                }
              >
                {children}
              </WhiteboardEditorShell>
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
        aspectRatio={
          whiteboard.profile.visual?.maxWidth && whiteboard.profile.visual?.maxHeight
            ? whiteboard.profile.visual.maxWidth / whiteboard.profile.visual.maxHeight
            : 16 / 9
        }
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

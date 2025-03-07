import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { TagCategoryValues, error as logError } from '@/core/logging/sentry/log';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { useGlobalGridColumns } from '@/core/ui/grid/constants';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { Identifiable } from '@/core/utils/Identifiable';
import CollaborativeExcalidrawWrapper from '@/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper';
import { CollabAPI } from '@/domain/common/whiteboard/excalidraw/collab/useCollab';
import useWhiteboardFilesManager from '@/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import WhiteboardDialogTemplatesLibrary from '@/domain/templates/components/WhiteboardDialog/WhiteboardDialogTemplatesLibrary';
import { WhiteboardTemplateContent } from '@/domain/templates/models/WhiteboardTemplate';
import type { ExportedDataState } from '@alkemio/excalidraw/dist/excalidraw/data/types';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/excalidraw/types';
import { DialogContent } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { Formik } from 'formik';
import { FormikProps } from 'formik/dist/types';
import { useTranslation } from 'react-i18next';
import {
  PreviewImageDimensions,
  WhiteboardPreviewImage,
  generateWhiteboardPreviewImages,
} from '../WhiteboardPreviewImages/WhiteboardPreviewImages';
import mergeWhiteboard from '../utils/mergeWhiteboard';
import whiteboardSchema from '../validation/whiteboardSchema';
import WhiteboardDialogFooter from './WhiteboardDialogFooter';
import WhiteboardDisplayName from './WhiteboardDisplayName';

export interface WhiteboardDetails {
  id: string;
  nameID: string; // NameID is used to name screenshots uploaded as visuals (banner, card...)
  contentUpdatePolicy?: ContentUpdatePolicy;
  profile: {
    id: string;
    displayName: string;
    storageBucket: { id: string };
    visual?: {
      id: string;
    } & PreviewImageDimensions;
    preview?: {
      id: string;
    } & PreviewImageDimensions;
    url?: string;
  };
  createdBy?: {
    id: string;
    profile: {
      displayName: string;
      url: string;
      avatar?: { id: string; uri: string };
    };
  };
}

interface WhiteboardDialogProps {
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
  };
  options: {
    show: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    headerActions?: ReactNode;
    dialogTitle: ReactNode;
    fullscreen?: boolean;
    allowFilesAttached?: boolean;
    readOnlyDisplayName?: boolean;
    editDisplayName?: boolean;
  };
  state?: {
    loadingWhiteboardValue?: boolean;
    changingWhiteboardLockState?: boolean;
  };
}

type RelevantExcalidrawState = Pick<ExportedDataState, 'appState' | 'elements' | 'files'>;

const WhiteboardDialog = ({ entities, actions, options, state, lastSuccessfulSavedDate }: WhiteboardDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { whiteboard } = entities;

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const collabApiRef = useRef<CollabAPI>(null);
  const editModeEnabled = options.canEdit;

  const columns = useGlobalGridColumns();

  const [lastSaveError, setLastSaveError] = useState<string | undefined>();
  const [isSceneInitialized, setSceneInitialized] = useState(false);

  const filesManager = useWhiteboardFilesManager({
    excalidrawAPI,
    storageBucketId: whiteboard?.profile?.storageBucket.id ?? '',
    allowFallbackToAttached: options.allowFilesAttached,
  });

  type PrepareWhiteboardResult =
    | {
        success: true;
        whiteboard: WhiteboardDetails;
        previewImages?: WhiteboardPreviewImage[];
      }
    | {
        success: false;
        error: string;
      };

  const prepareWhiteboardForUpdate = async (
    whiteboard: WhiteboardDetails,
    state: RelevantExcalidrawState | undefined,
    shouldUploadPreviewImages = true
  ): Promise<PrepareWhiteboardResult> => {
    if (!state) {
      return {
        success: false,
        error: 'Excalidraw state not defined',
      };
    }
    if (!whiteboard?.profile?.id) {
      return {
        success: false,
        error: 'Whiteboard profile not defined',
      };
    }
    if (!formikRef.current?.isValid) {
      return {
        success: false,
        error: 'Whiteboard form not valid',
      };
    }

    const previewImages =
      shouldUploadPreviewImages && !filesManager.loading.downloadingFiles
        ? await generateWhiteboardPreviewImages(whiteboard, state)
        : undefined;

    const displayName = formikRef.current?.values.displayName ?? whiteboard?.profile?.displayName;

    return {
      success: true,
      whiteboard: {
        ...whiteboard,
        profile: {
          ...whiteboard.profile,
          displayName,
        },
      },
      previewImages,
    };
  };

  const getWhiteboardState = async () => {
    if (!whiteboard || !excalidrawAPI) {
      return;
    }
    return {
      elements: excalidrawAPI.getSceneElements(),
      appState: excalidrawAPI.getAppState(),
      files: excalidrawAPI.getFiles(),
    };
  };

  const onClose = useCallback(async () => {
    if (editModeEnabled && collabApiRef.current?.isCollaborating() && whiteboard) {
      const whiteboardState = await getWhiteboardState();
      const prepareWhiteboardResult = await prepareWhiteboardForUpdate(whiteboard, whiteboardState);
      if (prepareWhiteboardResult.success) {
        const { whiteboard: updatedWhiteboard, previewImages } = prepareWhiteboardResult;
        actions.onUpdate(updatedWhiteboard, previewImages);
      } else {
        logError(new Error(`Error preparing whiteboard for update: '${prepareWhiteboardResult.error}'`), {
          category: TagCategoryValues.WHITEBOARD,
        });
      }
    }
    actions.onCancel();
  }, [editModeEnabled, collabApiRef, whiteboard, getWhiteboardState, prepareWhiteboardForUpdate, actions]);

  const handleImportTemplate = useCallback(
    async (template: WhiteboardTemplateContent) => {
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
    },
    [excalidrawAPI, notify, t]
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [handleDelete, isDeleting] = useLoadingState(async () => {
    if (whiteboard) {
      setDeleteDialogOpen(false);
      actions.onCancel();
      await actions.onDelete(whiteboard);
    }
  });

  const formikRef = useRef<FormikProps<{ displayName: string }>>(null);

  const initialValues = useMemo(
    () => ({ displayName: whiteboard?.profile?.displayName ?? '' }),
    [whiteboard?.profile?.displayName]
  );

  useEffect(() => {
    formikRef.current?.resetForm({
      values: initialValues,
    });
  }, [initialValues]);

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
          UIOptions: {
            canvasActions: {
              export: {
                saveFileToDisk: true,
              },
            },
          },
        }}
        actions={{
          onInitApi: setExcalidrawAPI,
          onRemoteSave: (error?: string) => {
            if (error) {
              setLastSaveError(error);
              actions.setConsecutiveSaveErrors?.(prevCount => prevCount + 1);
            } else {
              actions.setLastSuccessfulSavedDate?.(new Date());
              setLastSaveError(undefined);
              actions.setConsecutiveSaveErrors?.(0);
            }
          },
          onSceneInitChange: setSceneInitialized,
        }}
      >
        {({ children, mode, modeReason, restartCollaboration }) => {
          return (
            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              onSubmit={() => {}}
              validationSchema={whiteboardSchema}
            >
              <Dialog
                open={options.show}
                aria-labelledby="whiteboard-dialog"
                maxWidth={false}
                fullWidth
                sx={{ '& .MuiPaper-root': options.fullscreen ? { height: 1, maxHeight: 1 } : { height: '85vh' } }}
                onClose={onClose}
                fullScreen={options.fullscreen || columns <= 4}
              >
                <DialogHeader
                  actions={options.headerActions}
                  onClose={onClose}
                  titleContainerProps={{ flexDirection: 'row', gap: 0, marginRight: -1 }}
                >
                  <WhiteboardDisplayName
                    displayName={whiteboard?.profile?.displayName}
                    readOnlyDisplayName={options.readOnlyDisplayName}
                    editDisplayName={options.editDisplayName}
                    onChangeDisplayName={newDisplayName => actions.onChangeDisplayName(whiteboard?.id, newDisplayName)}
                  />
                  <WhiteboardDialogTemplatesLibrary
                    editModeEnabled={editModeEnabled}
                    disabled={!isSceneInitialized}
                    onImportTemplate={handleImportTemplate}
                  />
                </DialogHeader>
                <DialogContent sx={{ paddingY: 0 }}>{children}</DialogContent>
                <WhiteboardDialogFooter
                  collaboratorMode={mode}
                  whiteboardUrl={whiteboard.profile.url}
                  collaboratorModeReason={modeReason}
                  lastSaveError={lastSaveError}
                  onDelete={() => setDeleteDialogOpen(true)}
                  canDelete={options.canDelete}
                  onRestart={restartCollaboration}
                  canUpdateContent={options.canEdit!}
                  createdBy={whiteboard?.createdBy}
                  contentUpdatePolicy={whiteboard?.contentUpdatePolicy}
                />
              </Dialog>
            </Formik>
          );
        }}
      </CollaborativeExcalidrawWrapper>

      <ConfirmationDialog
        actions={{
          onConfirm: handleDelete,
          onCancel: () => setDeleteDialogOpen(false),
        }}
        options={{
          show: deleteDialogOpen,
        }}
        entities={{
          title: t('pages.whiteboard.delete.confirmationTitle'),
          content: t('pages.whiteboard.delete.confirmationText'),
          confirmButtonTextId: 'buttons.delete',
        }}
        state={{
          isLoading: isDeleting,
        }}
      />
    </>
  );
};

export default WhiteboardDialog;

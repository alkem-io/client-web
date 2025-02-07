import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import { FormikProps } from 'formik/dist/types';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/excalidraw/types';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import Loading from '@/core/ui/loading/Loading';
import { DialogContent } from '@/core/ui/dialog/deprecated';
import CollaborativeExcalidrawWrapper from '@/domain/common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper';
import type { ExportedDataState } from '@alkemio/excalidraw/dist/excalidraw/data/types';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import whiteboardSchema from '../validation/whiteboardSchema';
import { WhiteboardTemplateContent } from '@/domain/templates/models/WhiteboardTemplate';
import mergeWhiteboard from '../utils/mergeWhiteboard';
import { error as logError, TagCategoryValues } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  generateWhiteboardPreviewImages,
  PreviewImageDimensions,
  WhiteboardPreviewImage,
} from '../WhiteboardPreviewImages/WhiteboardPreviewImages';
import { CollabAPI } from '@/domain/common/whiteboard/excalidraw/collab/useCollab';
import useWhiteboardFilesManager from '@/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager';
import WhiteboardDialogFooter from './WhiteboardDialogFooter';
import { useLocation } from 'react-router-dom';
import WhiteboardDisplayName from './WhiteboardDisplayName';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { useGlobalGridColumns } from '@/core/ui/grid/constants';
import WhiteboardDialogTemplatesLibrary from '@/domain/templates/components/WhiteboardDialog/WhiteboardDialogTemplatesLibrary';
import { useWhiteboardLastUpdatedDateQuery } from '@/core/apollo/generated/apollo-hooks';
import { ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';

export interface WhiteboardDetails {
  id: string;
  nameID: string;
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
  actions: {
    onCancel: () => void;
    onUpdate: (
      whiteboard: WhiteboardDetails,
      previewImages?: WhiteboardPreviewImage[]
    ) => Promise<{ success: boolean; errors?: string[] }>;
    onChangeDisplayName: (whiteboardId: string | undefined, newDisplayName: string) => Promise<void>;
    onDelete: (whiteboard: Identifiable) => Promise<void>;
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

const useStyles = makeStyles(theme => ({
  dialogRoot: {
    height: '85vh',
  },
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    padding: `${theme.spacing(0)} ${theme.spacing(1)}`,
    zIndex: 2,
  },
  dialogFullscreen: {
    height: '100%',
    maxHeight: '100%',
  },
}));

type RelevantExcalidrawState = Pick<ExportedDataState, 'appState' | 'elements' | 'files'>;

const WhiteboardDialog = ({ entities, actions, options, state }: WhiteboardDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { whiteboard } = entities;

  const { pathname } = useLocation();

  const initialPathname = useRef(pathname).current;

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const collabApiRef = useRef<CollabAPI>(null);
  const editModeEnabled = options.canEdit;

  const styles = useStyles();
  const columns = useGlobalGridColumns();

  const [lastSavedDate, setLastSavedDate] = useState<Date | undefined>(undefined);
  const [isSceneInitialized, setSceneInitialized] = useState(false);

  const { data: lastSaved } = useWhiteboardLastUpdatedDateQuery({
    variables: { whiteboardId: whiteboard?.id! },
    skip: !whiteboard?.id,
    fetchPolicy: 'network-only',
  });

  if (!lastSavedDate && lastSaved?.lookup.whiteboard?.updatedDate) {
    setLastSavedDate(new Date(lastSaved?.lookup.whiteboard?.updatedDate));
  }

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
    if (pathname !== initialPathname) {
      onClose();
    }
  }, [pathname]);

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
        entities={{ whiteboard, filesManager, lastSavedDate }}
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
          onRemoteSave: () => {
            setLastSavedDate(new Date());
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
                classes={{
                  paper: options.fullscreen ? styles.dialogFullscreen : styles.dialogRoot,
                }}
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
                  collaboratorModeReason={modeReason}
                  lastSavedDate={lastSavedDate}
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

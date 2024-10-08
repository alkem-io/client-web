import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import { FormikProps } from 'formik/dist/types';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/types/types';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import Loading from '../../../../core/ui/loading/Loading';
import { DialogContent } from '../../../../core/ui/dialog/deprecated';
import CollaborativeExcalidrawWrapper from '../../../common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper';
import type { ExportedDataState } from '@alkemio/excalidraw/types/data/types';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import whiteboardSchema from '../validation/whiteboardSchema';
import { WhiteboardTemplateContent } from '../../../templates/models/WhiteboardTemplate';
import mergeWhiteboard from '../utils/mergeWhiteboard';
import { error as logError, TagCategoryValues } from '../../../../core/logging/sentry/log';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { WhiteboardWithContent } from '../containers/WhiteboardContentContainer';
import {
  generateWhiteboardPreviewImages,
  WhiteboardPreviewImage,
} from '../WhiteboardPreviewImages/WhiteboardPreviewImages';
import { CollabAPI } from '../../../common/whiteboard/excalidraw/collab/useCollab';
import useWhiteboardFilesManager from '../../../common/whiteboard/excalidraw/useWhiteboardFilesManager';
import WhiteboardDialogFooter from './WhiteboardDialogFooter';
import { useLocation } from 'react-router-dom';
import WhiteboardDisplayName from './WhiteboardDisplayName';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { useGlobalGridColumns } from '../../../../core/ui/grid/constants';
import WhiteboardDialogTemplatesLibrary from '../../../templates/components/WhiteboardDialog/WhiteboardDialogTemplatesLibrary';
import { useWhiteboardLastUpdatedDateQuery } from '../../../../core/apollo/generated/apollo-hooks';

interface WhiteboardDialogProps<Whiteboard extends WhiteboardWithContent> {
  entities: {
    whiteboard?: Whiteboard;
  };
  actions: {
    onCancel: () => void;
    onUpdate: (
      whiteboard: Whiteboard,
      previewImages?: WhiteboardPreviewImage[]
    ) => Promise<{ success: boolean; errors?: string[] }>;
    onChangeDisplayName: (whiteboardId: string | undefined, newDisplayName: string) => Promise<void>;
    onDelete: (whiteboard: Whiteboard) => Promise<void>;
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
    updatingWhiteboardContent?: boolean;
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

const WhiteboardDialog = <Whiteboard extends WhiteboardWithContent>({
  entities,
  actions,
  options,
  state,
}: WhiteboardDialogProps<Whiteboard>) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { whiteboard } = entities;

  const { pathname } = useLocation();

  const initialPathname = useRef(pathname).current;

  useEffect(() => {
    if (pathname !== initialPathname) {
      onClose();
    }
  }, [pathname]);

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const collabApiRef = useRef<CollabAPI>(null);
  const editModeEnabled = options.canEdit;

  const styles = useStyles();
  const columns = useGlobalGridColumns();

  const [lastSavedDate, setLastSavedDate] = useState<Date | undefined>(undefined);

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

  const prepareWhiteboardForUpdate = async (
    whiteboard: WhiteboardWithContent,
    state: RelevantExcalidrawState | undefined,
    shouldUploadPreviewImages = true
  ): Promise<{
    whiteboard: Whiteboard;
    previewImages?: WhiteboardPreviewImage[];
  }> => {
    if (!state) {
      throw new Error('Excalidraw state not defined');
    }

    if (!whiteboard?.profile?.id) {
      throw new Error('Whiteboard profile not defined');
    }

    const previewImages =
      shouldUploadPreviewImages && !filesManager.loading.downloadingFiles
        ? await generateWhiteboardPreviewImages(whiteboard, state)
        : undefined;

    if (!formikRef.current?.isValid) {
      throw new Error('Form not valid');
    }

    const displayName = formikRef.current?.values.displayName ?? whiteboard?.profile?.displayName;

    return {
      whiteboard: {
        ...whiteboard,
        profile: {
          ...whiteboard.profile,
          displayName,
        },
      } as Whiteboard,
      previewImages,
    };
  };

  const getWhiteboardState = async () => {
    if (!whiteboard || !excalidrawAPI) {
      return;
    }
    const content = JSON.parse(whiteboard.content) as RelevantExcalidrawState;
    return {
      ...content,
      elements: excalidrawAPI.getSceneElements(),
      appState: excalidrawAPI.getAppState(),
      files: excalidrawAPI.getFiles(),
    };
  };

  const onClose = async () => {
    if (editModeEnabled && collabApiRef.current?.isCollaborating() && whiteboard) {
      const whiteboardState = await getWhiteboardState();
      const { whiteboard: updatedWhiteboard, previewImages } = await prepareWhiteboardForUpdate(
        whiteboard,
        whiteboardState
      );
      actions.onUpdate(updatedWhiteboard, previewImages);
    }
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
          onUpdate: async state => {
            const { whiteboard: updatedWhiteboard, previewImages } = await prepareWhiteboardForUpdate(
              whiteboard,
              state,
              false
            );
            return actions.onUpdate(updatedWhiteboard, previewImages);
          },
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
                  updating={state?.updatingWhiteboardContent}
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

import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import { FormikProps } from 'formik/dist/types';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/excalidraw/types';
import { Delete, Save } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import Loading from '@/core/ui/loading/Loading';
import { DialogContent } from '@/core/ui/dialog/deprecated';
import ExcalidrawWrapper from '@/domain/common/whiteboard/excalidraw/ExcalidrawWrapper';
import type { ExportedDataState } from '@alkemio/excalidraw/dist/excalidraw/data/types';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Box, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Actions } from '@/core/ui/actions/Actions';
import { gutters } from '@/core/ui/grid/utils';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import whiteboardSchema from '../validation/whiteboardSchema';
import isWhiteboardContentEqual from '../utils/isWhiteboardContentEqual';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import WhiteboardDialogTemplatesLibrary from '@/domain/templates/components/WhiteboardDialog/WhiteboardDialogTemplatesLibrary';
import mergeWhiteboard from '../utils/mergeWhiteboard';
import { error as logError, TagCategoryValues } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  generateWhiteboardPreviewImages,
  WhiteboardPreviewImage,
} from '../WhiteboardPreviewImages/WhiteboardPreviewImages';
import useWhiteboardFilesManager from '@/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager';
import { WhiteboardTemplateContent } from '@/domain/templates/models/WhiteboardTemplate';
import { WhiteboardDetails } from './WhiteboardDialog';
import { Identifiable } from '@/core/utils/Identifiable';

export interface WhiteboardWithContent extends WhiteboardDetails {
  content: string;
}

type SingleUserWhiteboardDialogProps = {
  entities: {
    whiteboard?: WhiteboardWithContent;
  };
  actions: {
    onCancel: () => void;
    onUpdate: (whiteboard: WhiteboardWithContent, previewImages?: WhiteboardPreviewImage[]) => Promise<void>;
    onDelete?: (whiteboard: Identifiable) => Promise<void>;
  };
  options: {
    show: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    headerActions?: ReactNode;
    fixedDialogTitle?: ReactNode;
    fullscreen?: boolean;
    allowFilesAttached?: boolean;
  };
  state?: {
    updatingWhiteboard?: boolean;
    loadingWhiteboardContent?: boolean;
    changingWhiteboardLockState?: boolean;
  };
};

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
  dialogContent: {
    padding: theme.spacing(2),
    paddingTop: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogFullscreen: {
    height: '100%',
    maxHeight: '100%',
  },
}));

type RelevantExcalidrawState = Pick<ExportedDataState, 'appState' | 'elements' | 'files'>;

const SingleUserWhiteboardDialog = ({ entities, actions, options, state }: SingleUserWhiteboardDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { whiteboard } = entities;
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

  const styles = useStyles();

  const getExcalidrawStateFromApi = () => {
    if (!excalidrawAPI) {
      return;
    }

    const appState = excalidrawAPI.getAppState();
    const elements = excalidrawAPI.getSceneElements();
    const files = excalidrawAPI.getFiles();

    return { appState, elements, files };
  };

  const filesManager = useWhiteboardFilesManager({
    excalidrawAPI,
    storageBucketId: whiteboard?.profile?.storageBucket.id ?? '',
    allowFallbackToAttached: options.allowFilesAttached,
  });

  const handleUpdate = async (whiteboard: WhiteboardWithContent, state: RelevantExcalidrawState | undefined) => {
    if (!state) {
      return;
    }

    const { serializeAsJSON } = await import('@alkemio/excalidraw');

    const { appState, elements, files } = await filesManager.convertLocalFilesToRemoteInWhiteboard(state);

    const previewImages = await generateWhiteboardPreviewImages(whiteboard, state);
    const content = serializeAsJSON(elements, appState, files ?? {}, 'local');

    if (!formikRef.current?.isValid) {
      return;
    }

    const displayName = formikRef.current?.values.displayName ?? whiteboard?.profile?.displayName;

    return actions.onUpdate(
      {
        ...whiteboard,
        profile: {
          ...whiteboard.profile,
          displayName,
        },
        content,
      },
      previewImages
    );
  };

  const handleSave = async whiteboard => {
    const state = getExcalidrawStateFromApi();

    formikRef.current?.setTouched({ displayName: true }, true);

    await handleUpdate(whiteboard, state);
  };

  const onClose = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (excalidrawAPI && options.canEdit) {
      const { serializeAsJSON } = await import('@alkemio/excalidraw');

      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();
      const content = serializeAsJSON(elements, appState, files, 'local');

      if (!isWhiteboardContentEqual(whiteboard?.content, content) || formikRef.current?.dirty) {
        if (
          !window.confirm('It seems you have unsaved changes which will be lost. Are you sure you want to continue?')
        ) {
          event.stopPropagation();
          event.preventDefault();
          return;
        }
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

  return (
    <Dialog
      open={options.show}
      aria-labelledby="whiteboard-dialog"
      maxWidth={false}
      fullWidth
      classes={{
        paper: options.fullscreen ? styles.dialogFullscreen : styles.dialogRoot,
      }}
      onClose={onClose}
      fullScreen={options.fullscreen}
    >
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        onSubmit={() => {}}
        validationSchema={whiteboardSchema}
      >
        {({ isValid }) => (
          <>
            <DialogHeader
              actions={options.headerActions}
              onClose={onClose}
              titleContainerProps={{ flexDirection: 'row' }}
            >
              {options.fixedDialogTitle ? (
                options.fixedDialogTitle
              ) : (
                <Box
                  component={FormikInputField}
                  title={t('fields.displayName')}
                  name="displayName"
                  size="small"
                  maxWidth={gutters(30)}
                />
              )}
              <WhiteboardDialogTemplatesLibrary editModeEnabled onImportTemplate={handleImportTemplate} />
            </DialogHeader>
            <DialogContent classes={{ root: styles.dialogContent }}>
              {!state?.loadingWhiteboardContent && whiteboard && (
                <ExcalidrawWrapper
                  entities={{
                    whiteboard,
                    filesManager,
                  }}
                  options={{
                    viewModeEnabled: !options.canEdit,
                    UIOptions: {
                      canvasActions: {
                        export: options.canEdit
                          ? {
                              saveFileToDisk: true,
                            }
                          : false,
                      },
                    },
                  }}
                  actions={{
                    onUpdate: state => {
                      handleUpdate(whiteboard, state);
                    },
                    onInitApi: setExcalidrawAPI,
                  }}
                />
              )}
              {state?.loadingWhiteboardContent && <Loading text="Loading whiteboard..." />}
            </DialogContent>
            <Actions padding={gutters()} paddingTop={0} justifyContent="space-between">
              {actions.onDelete && (
                <Button startIcon={<Delete />} onClick={() => actions.onDelete!(whiteboard!)} color="error">
                  {t('pages.whiteboard.state-actions.delete')}
                </Button>
              )}
              <FlexSpacer />
              <LoadingButton
                startIcon={<Save />}
                onClick={() => handleSave(whiteboard!)}
                loadingPosition="start"
                variant="contained"
                loading={state?.changingWhiteboardLockState || state?.updatingWhiteboard}
                disabled={!isValid}
              >
                {t('pages.whiteboard.state-actions.save')}
              </LoadingButton>
            </Actions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default SingleUserWhiteboardDialog;

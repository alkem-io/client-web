import { lazyImportWithErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { TagCategoryValues, error as logError } from '@/core/logging/sentry/log';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { gutters } from '@/core/ui/grid/utils';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import { Identifiable } from '@/core/utils/Identifiable';
import ExcalidrawWrapper from '@/domain/common/whiteboard/excalidraw/ExcalidrawWrapper';
import useWhiteboardFilesManager from '@/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager';
import WhiteboardDialogTemplatesLibrary from '@/domain/templates/components/WhiteboardDialog/WhiteboardDialogTemplatesLibrary';
import { WhiteboardTemplateContent } from '@/domain/templates/models/WhiteboardTemplate';
import type { serializeAsJSON as ExcalidrawSerializeAsJSON } from '@alkemio/excalidraw';
import type { ExportedDataState } from '@alkemio/excalidraw/dist/types/excalidraw/data/types';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { Delete, Save } from '@mui/icons-material';
import { Box, Button, DialogContent } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { Formik } from 'formik';
import { FormikProps } from 'formik/dist/types';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WhiteboardPreviewImage } from '../WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { generateWhiteboardVisuals } from '../WhiteboardVisuals/generateWhiteboardVisuals';
import isWhiteboardContentEqual from '../utils/isWhiteboardContentEqual';
import mergeWhiteboard from '../utils/mergeWhiteboard';
import whiteboardSchema from '../validation/whiteboardSchema';
import { WhiteboardDetails } from './WhiteboardDialog';

type ExcalidrawUtils = {
  serializeAsJSON: typeof ExcalidrawSerializeAsJSON;
};

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

type RelevantExcalidrawState = Pick<ExportedDataState, 'appState' | 'elements' | 'files'>;

const SingleUserWhiteboardDialog = ({ entities, actions, options, state }: SingleUserWhiteboardDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { whiteboard } = entities;
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

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
    const { serializeAsJSON } = await lazyImportWithErrorHandler<ExcalidrawUtils>(() => import('@alkemio/excalidraw'));

    const { appState, elements, files } = await filesManager.convertLocalFilesToRemoteInWhiteboard(state);

    const previewImages = await generateWhiteboardVisuals(whiteboard, excalidrawAPI);
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
      const { serializeAsJSON } = await lazyImportWithErrorHandler<ExcalidrawUtils>(
        () => import('@alkemio/excalidraw')
      );

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
      sx={{ '& .MuiPaper-root': options.fullscreen ? { height: 1, maxHeight: 1 } : { height: '85vh' } }}
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
            <DialogContent sx={{ pt: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
              <Button
                startIcon={<Save />}
                onClick={() => handleSave(whiteboard!)}
                loadingPosition="start"
                variant="contained"
                loading={state?.changingWhiteboardLockState || state?.updatingWhiteboard}
                disabled={!isValid}
              >
                {t('pages.whiteboard.state-actions.save')}
              </Button>
            </Actions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default SingleUserWhiteboardDialog;

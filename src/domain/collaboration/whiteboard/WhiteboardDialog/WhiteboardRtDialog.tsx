import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import { FormikProps } from 'formik/dist/types';
import { serializeAsJSON } from '@alkemio/excalidraw';
import { ExcalidrawAPIRefValue } from '@alkemio/excalidraw/types/types';
import { Save } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import Loading from '../../../../core/ui/loading/Loading';
import { DialogContent } from '../../../../core/ui/dialog/deprecated';
import CollaborativeExcalidrawWrapper from '../../../common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper';
import { ExportedDataState } from '@alkemio/excalidraw/types/data/types';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import whiteboardSchema from '../validation/whiteboardSchema';
import isWhiteboardValueEqual from '../utils/isWhiteboardValueEqual';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import WhiteboardTemplatesLibrary from '../WhiteboardTemplatesLibrary/WhiteboardTemplatesLibrary';
import { WhiteboardTemplateWithValue } from '../WhiteboardTemplateCard/WhiteboardTemplate';
import mergeWhiteboard from '../utils/mergeWhiteboard';
import { error as logError } from '../../../../core/logging/sentry/log';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { WhiteboardRtWithContent, WhiteboardRtWithoutContent } from '../containers/WhiteboardRtValueContainer';
import {
  WhiteboardPreviewImage,
  generateWhiteboardPreviewImages,
} from '../WhiteboardPreviewImages/WhiteboardPreviewImages';

interface WhiteboardDialogProps<Whiteboard extends WhiteboardRtWithContent> {
  entities: {
    whiteboard?: Whiteboard;
  };
  actions: {
    onCancel: (whiteboard: WhiteboardRtWithoutContent<Whiteboard>) => void;
    onUpdate: (whiteboard: Whiteboard, previewImages?: WhiteboardPreviewImage[]) => void;
  };
  options: {
    show: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    headerActions?: ReactNode;
    fixedDialogTitle?: ReactNode;
  };
  state?: {
    updatingWhiteboard?: boolean;
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
  dialogContent: {
    padding: theme.spacing(2),
    paddingTop: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

type RelevantExcalidrawState = Pick<ExportedDataState, 'appState' | 'elements' | 'files'>;

const WhiteboardRtDialog = <Whiteboard extends WhiteboardRtWithContent>({
  entities,
  actions,
  options,
  state,
}: WhiteboardDialogProps<Whiteboard>) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { whiteboard } = entities;
  const excalidrawApiRef = useRef<ExcalidrawAPIRefValue>(null);

  const styles = useStyles();

  const getExcalidrawStateFromApi = async (
    excalidrawApi: ExcalidrawAPIRefValue | null
  ): Promise<RelevantExcalidrawState | undefined> => {
    if (!excalidrawApi) {
      return;
    }

    const imperativeApi = await excalidrawApi.readyPromise;

    if (!imperativeApi) {
      return;
    }

    const appState = imperativeApi.getAppState();
    const elements = imperativeApi.getSceneElements();
    const files = imperativeApi.getFiles();

    return { appState, elements, files };
  };

  const handleUpdate = async (whiteboard: WhiteboardRtWithContent, state: RelevantExcalidrawState | undefined) => {
    if (!state) {
      return;
    }

    const { appState, elements, files } = state;

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
      } as Whiteboard,
      previewImages
    );
  };

  const saveWhiteboard = async (whiteboard: Whiteboard) => {
    const state = await getExcalidrawStateFromApi(excalidrawApiRef.current);

    formikRef.current?.setTouched({ displayName: true }, true);

    await handleUpdate(whiteboard, state);
  };

  const onClose = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const whiteboardApi = await excalidrawApiRef.current?.readyPromise;

    if (whiteboardApi) {
      const elements = whiteboardApi.getSceneElements();
      const appState = whiteboardApi.getAppState();
      const files = whiteboardApi.getFiles();
      const value = serializeAsJSON(elements, appState, files, 'local');

      if (!isWhiteboardValueEqual(whiteboard?.content, value) || formikRef.current?.dirty) {
        if (
          !window.confirm('It seems you have unsaved changes which will be lost. Are you sure you want to continue?')
        ) {
          event.stopPropagation();
          event.preventDefault();
          return;
        }
      }
    }

    actions.onCancel(whiteboard!);
  };

  const handleImportTemplate = async (template: WhiteboardTemplateWithValue) => {
    const whiteboardApi = await excalidrawApiRef.current?.readyPromise;
    if (whiteboardApi) {
      try {
        mergeWhiteboard(whiteboardApi, template.value);
      } catch (err) {
        notify(t('whiteboard-templates.error-importing'), 'error');
        logError(new Error(`Error importing whiteboard template ${template.id}: '${err}'`));
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
        paper: styles.dialogRoot,
      }}
      onClose={onClose}
    >
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        onSubmit={() => {}}
        validationSchema={whiteboardSchema}
      >
        {() => (
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
              <WhiteboardTemplatesLibrary onSelectTemplate={handleImportTemplate} />
              <span>
                RT<sup title=":)">beta</sup>
              </span>
            </DialogHeader>
            <DialogContent classes={{ root: styles.dialogContent }}>
              {!state?.loadingWhiteboardValue && whiteboard && (
                <CollaborativeExcalidrawWrapper
                  entities={{ whiteboard }}
                  ref={excalidrawApiRef}
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
                    onUpdate: state => {
                      handleUpdate(whiteboard, state);
                    },
                  }}
                />
              )}
              {state?.loadingWhiteboardValue && <Loading text="Loading whiteboard..." />}
            </DialogContent>
            <Actions padding={gutters()} paddingTop={0} justifyContent="space-between">
              <LoadingButton
                startIcon={<Save />}
                onClick={() => saveWhiteboard(whiteboard!)}
                loadingPosition="start"
                variant="contained"
                loading={state?.updatingWhiteboard}
              >
                {t('buttons.save')}
              </LoadingButton>
            </Actions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default WhiteboardRtDialog;

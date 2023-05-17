import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import { FormikProps } from 'formik/dist/types';
import { serializeAsJSON } from '@alkemio/excalidraw';
import { ExcalidrawAPIRefValue } from '@alkemio/excalidraw/types/types';
import { Delete, Save } from '@mui/icons-material';
import LockClockIcon from '@mui/icons-material/LockClock';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import { LockedByDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';
import TranslationKey from '../../../../types/TranslationKey';
import { Loading } from '../../../../common/components/core';
import { DialogContent } from '../../../../common/components/core/dialog';
import CanvasWhiteboard from '../../../../common/components/composite/entities/Canvas/CanvasWhiteboard';
import { ExportedDataState } from '@alkemio/excalidraw/types/data/types';
import Authorship from '../../../../core/ui/authorship/Authorship';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Box, Button, ButtonProps } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import FlexSpacer from '../../../../core/ui/utils/FlexSpacer';
import canvasSchema from '../validation/canvasSchema';
import isCanvasValueEqual from '../utils/isCanvasValueEqual';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import { PageTitle } from '../../../../core/ui/typography';
import WhiteboardTemplatesLibrary from '../WhiteboardTemplatesLibrary/WhiteboardTemplatesLibrary';
import { WhiteboardTemplateWithValue } from '../WhiteboardTemplateCard/WhiteboardTemplate';
import mergeCanvas from '../utils/mergeCanvas';
import { error as logError } from '../../../../services/logging/sentry/log';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { CanvasWithValue, CanvasWithoutValue } from '../containers/CanvasValueContainer';
import {
  WhiteboardPreviewImage,
  generateWhiteboardPreviewImages,
} from '../WhiteboardPreviewImages/WhiteboardPreviewImages';

interface CanvasDialogProps<Canvas extends CanvasWithValue> {
  entities: {
    canvas?: Canvas;
    lockedBy?: LockedByDetailsFragment;
  };
  actions: {
    onCancel: (canvas: CanvasWithoutValue<Canvas>) => void;
    onCheckin?: (canvas: CanvasWithoutValue<Canvas>) => void;
    onCheckout?: (canvas: CanvasWithoutValue<Canvas>) => void;
    onUpdate: (canvas: Canvas, previewImages?: WhiteboardPreviewImage[]) => void;
    onDelete?: (canvas: CanvasWithoutValue<Canvas>) => void;
  };
  options: {
    show: boolean;
    canCheckout?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    checkedOutByMe: boolean;
    headerActions?: ReactNode;
    fixedDialogTitle?: ReactNode;
  };
  state?: {
    updatingCanvas?: boolean;
    loadingCanvasValue?: boolean;
    changingCanvasLockState?: boolean;
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

interface Option extends Omit<ButtonProps, 'disabled'> {
  label: TranslationKey;
  disabled: (formik: Pick<FormikProps<unknown>, 'isValid'>) => ButtonProps['disabled'];
}

type CanvasAction = 'save-and-checkin' | 'checkout';

type RelevantExcalidrawState = Pick<ExportedDataState, 'appState' | 'elements' | 'files'>;

const CanvasDialog = <Canvas extends CanvasWithValue>({
  entities,
  actions,
  options,
  state,
}: CanvasDialogProps<Canvas>) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { canvas, lockedBy } = entities;
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

  const handleUpdate = async (canvas: CanvasWithValue, state: RelevantExcalidrawState | undefined) => {
    if (!state) {
      return;
    }

    const { appState, elements, files } = state;

    const previewImages = await generateWhiteboardPreviewImages(canvas, state);

    const value = serializeAsJSON(elements, appState, files ?? {}, 'local');

    if (!formikRef.current?.isValid) {
      return;
    }

    const displayName = formikRef.current?.values.displayName ?? canvas?.profile?.displayName;

    return actions.onUpdate(
      {
        ...canvas,
        profile: {
          ...canvas.profile,
          displayName,
        },
        value,
      } as Canvas,
      previewImages
    );
  };

  const actionMap: { [key in keyof typeof canvasActions]: ((canvas: Canvas) => void) | undefined } = {
    'save-and-checkin': async canvas => {
      const state = await getExcalidrawStateFromApi(excalidrawApiRef.current);

      formikRef.current?.setTouched({ displayName: true }, true);

      await handleUpdate(canvas, state);

      await actions.onCheckin?.(canvas);
    },
    checkout: actions.onCheckout,
  };

  const onClose = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const canvasApi = await excalidrawApiRef.current?.readyPromise;

    if (canvasApi && options.canEdit) {
      const elements = canvasApi.getSceneElements();
      const appState = canvasApi.getAppState();
      const files = canvasApi.getFiles();
      const value = serializeAsJSON(elements, appState, files, 'local');

      if (!isCanvasValueEqual(canvas?.value, value) || formikRef.current?.dirty) {
        if (
          !window.confirm('It seems you have unsaved changes which will be lost. Are you sure you want to continue?')
        ) {
          event.stopPropagation();
          event.preventDefault();
          return;
        }
      }
    }

    actions.onCancel(canvas!);
  };

  const handleImportTemplate = async (template: WhiteboardTemplateWithValue) => {
    const canvasApi = await excalidrawApiRef.current?.readyPromise;
    if (canvasApi && options.canEdit && options.checkedOutByMe) {
      try {
        mergeCanvas(canvasApi, template.value);
      } catch (err) {
        notify(t('canvas-templates.error-importing'), 'error');
        logError(new Error(`Error importing canvas template ${template.id}: '${err}'`));
      }
    }
  };

  const currentAction: CanvasAction = options.checkedOutByMe ? 'save-and-checkin' : 'checkout';

  const formikRef = useRef<FormikProps<{ displayName: string }>>(null);

  const initialValues = useMemo(
    () => ({ displayName: canvas?.profile?.displayName ?? '' }),
    [canvas?.profile?.displayName]
  );

  useEffect(() => {
    formikRef.current?.resetForm({
      values: initialValues,
    });
  }, [initialValues]);

  const canvasActions: Record<CanvasAction, Option> = {
    'save-and-checkin': {
      label: 'pages.canvas.state-actions.save',
      disabled: ({ isValid }) => !isValid,
      startIcon: <Save />,
    },
    checkout: {
      label: 'pages.canvas.state-actions.check-out',
      disabled: () => !options.canCheckout,
      startIcon: <LockClockIcon />,
    },
  };

  return (
    <Dialog
      open={options.show}
      aria-labelledby="canvas-dialog"
      maxWidth={false}
      fullWidth
      classes={{
        paper: styles.dialogRoot,
      }}
      onClose={onClose}
    >
      <Formik innerRef={formikRef} initialValues={initialValues} onSubmit={() => {}} validationSchema={canvasSchema}>
        {({ isValid }) => (
          <>
            <DialogHeader
              actions={options.headerActions}
              onClose={onClose}
              titleContainerProps={{ flexDirection: options.checkedOutByMe ? 'row' : 'column' }}
            >
              {options.checkedOutByMe ? (
                <>
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
                </>
              ) : (
                <>
                  <Authorship authorAvatarUri={canvas?.createdBy?.profile.visual?.uri} date={canvas?.createdDate}>
                    {canvas?.createdBy?.profile.displayName}
                  </Authorship>
                  <PageTitle>{canvas?.profile?.displayName}</PageTitle>
                </>
              )}
            </DialogHeader>
            <DialogContent classes={{ root: styles.dialogContent }}>
              {!state?.loadingCanvasValue && canvas && (
                <CanvasWhiteboard
                  entities={{ canvas }}
                  ref={excalidrawApiRef}
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
                      handleUpdate(canvas, state);
                    },
                  }}
                />
              )}
              {state?.loadingCanvasValue && <Loading text="Loading canvas..." />}
            </DialogContent>
            <Actions padding={gutters()} paddingTop={0} justifyContent="space-between">
              {options.checkedOutByMe && actions.onDelete && (
                <Button startIcon={<Delete />} onClick={() => actions.onDelete!(canvas!)} color="error">
                  {t('pages.canvas.state-actions.delete')}
                </Button>
              )}
              <FlexSpacer />
              {lockedBy && (
                <Authorship authorAvatarUri={lockedBy.profile.visual?.uri}>
                  {t('pages.canvas.locked-by', { user: lockedBy.profile.displayName })}
                </Authorship>
              )}
              <LoadingButton
                startIcon={canvasActions[currentAction].startIcon}
                onClick={() => actionMap[currentAction]?.(canvas!)}
                loadingPosition="start"
                variant="contained"
                loading={state?.changingCanvasLockState || state?.updatingCanvas}
                disabled={canvasActions[currentAction].disabled({ isValid })}
              >
                {t(canvasActions[currentAction].label)}
              </LoadingButton>
            </Actions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default CanvasDialog;

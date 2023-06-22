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
import WhiteboardWhiteboard from '../../../../common/components/composite/entities/Whiteboard/WhiteboardWhiteboard';
import { ExportedDataState } from '@alkemio/excalidraw/types/data/types';
import Authorship from '../../../../core/ui/authorship/Authorship';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Box, Button, ButtonProps } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import FlexSpacer from '../../../../core/ui/utils/FlexSpacer';
import whiteboardSchema from '../validation/whiteboardSchema';
import isWhiteboardValueEqual from '../utils/isWhiteboardValueEqual';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { PageTitle } from '../../../../core/ui/typography';
import WhiteboardTemplatesLibrary from '../WhiteboardTemplatesLibrary/WhiteboardTemplatesLibrary';
import { WhiteboardTemplateWithValue } from '../WhiteboardTemplateCard/WhiteboardTemplate';
import mergeWhiteboard from '../utils/mergeWhiteboard';
import { error as logError } from '../../../../services/logging/sentry/log';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { WhiteboardWithValue, WhiteboardWithoutValue } from '../containers/WhiteboardValueContainer';
import {
  WhiteboardPreviewImage,
  generateWhiteboardPreviewImages,
} from '../WhiteboardPreviewImages/WhiteboardPreviewImages';

interface WhiteboardDialogProps<Whiteboard extends WhiteboardWithValue> {
  entities: {
    whiteboard?: Whiteboard;
    lockedBy?: LockedByDetailsFragment;
  };
  actions: {
    onCancel: (whiteboard: WhiteboardWithoutValue<Whiteboard>) => void;
    onCheckin?: (whiteboard: WhiteboardWithoutValue<Whiteboard>) => void;
    onCheckout?: (whiteboard: WhiteboardWithoutValue<Whiteboard>) => void;
    onUpdate: (whiteboard: Whiteboard, previewImages?: WhiteboardPreviewImage[]) => void;
    onDelete?: (whiteboard: WhiteboardWithoutValue<Whiteboard>) => void;
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

interface Option extends Omit<ButtonProps, 'disabled'> {
  label: TranslationKey;
  disabled: (formik: Pick<FormikProps<unknown>, 'isValid'>) => ButtonProps['disabled'];
}

type WhiteboardAction = 'save-and-checkin' | 'checkout';

type RelevantExcalidrawState = Pick<ExportedDataState, 'appState' | 'elements' | 'files'>;

const WhiteboardDialog = <Whiteboard extends WhiteboardWithValue>({
  entities,
  actions,
  options,
  state,
}: WhiteboardDialogProps<Whiteboard>) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { whiteboard, lockedBy } = entities;
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

  const handleUpdate = async (whiteboard: WhiteboardWithValue, state: RelevantExcalidrawState | undefined) => {
    if (!state) {
      return;
    }

    const { appState, elements, files } = state;

    const previewImages = await generateWhiteboardPreviewImages(whiteboard, state);

    const value = serializeAsJSON(elements, appState, files ?? {}, 'local');

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
        value,
      } as Whiteboard,
      previewImages
    );
  };

  const actionMap: { [key in keyof typeof whiteboardActions]: ((whiteboard: Whiteboard) => void) | undefined } = {
    'save-and-checkin': async whiteboard => {
      const state = await getExcalidrawStateFromApi(excalidrawApiRef.current);

      formikRef.current?.setTouched({ displayName: true }, true);

      await handleUpdate(whiteboard, state);

      await actions.onCheckin?.(whiteboard);
    },
    checkout: actions.onCheckout,
  };

  const onClose = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const whiteboardApi = await excalidrawApiRef.current?.readyPromise;

    if (whiteboardApi && options.canEdit) {
      const elements = whiteboardApi.getSceneElements();
      const appState = whiteboardApi.getAppState();
      const files = whiteboardApi.getFiles();
      const value = serializeAsJSON(elements, appState, files, 'local');

      if (!isWhiteboardValueEqual(whiteboard?.value, value) || formikRef.current?.dirty) {
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
    if (whiteboardApi && options.canEdit && options.checkedOutByMe) {
      try {
        mergeWhiteboard(whiteboardApi, template.value);
      } catch (err) {
        notify(t('whiteboard-templates.error-importing'), 'error');
        logError(new Error(`Error importing whiteboard template ${template.id}: '${err}'`));
      }
    }
  };

  const currentAction: WhiteboardAction = options.checkedOutByMe ? 'save-and-checkin' : 'checkout';

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

  const whiteboardActions: Record<WhiteboardAction, Option> = {
    'save-and-checkin': {
      label: 'pages.whiteboard.state-actions.save',
      disabled: ({ isValid }) => !isValid,
      startIcon: <Save />,
    },
    checkout: {
      label: 'pages.whiteboard.state-actions.check-out',
      disabled: () => !options.canCheckout,
      startIcon: <LockClockIcon />,
    },
  };

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
                  <Authorship
                    authorAvatarUri={whiteboard?.createdBy?.profile.visual?.uri}
                    date={whiteboard?.createdDate}
                  >
                    {whiteboard?.createdBy?.profile.displayName}
                  </Authorship>
                  <PageTitle>{whiteboard?.profile?.displayName}</PageTitle>
                </>
              )}
            </DialogHeader>
            <DialogContent classes={{ root: styles.dialogContent }}>
              {!state?.loadingWhiteboardValue && whiteboard && (
                <WhiteboardWhiteboard
                  entities={{ whiteboard }}
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
                      handleUpdate(whiteboard, state);
                    },
                  }}
                />
              )}
              {state?.loadingWhiteboardValue && <Loading text="Loading whiteboard..." />}
            </DialogContent>
            <Actions padding={gutters()} paddingTop={0} justifyContent="space-between">
              {options.checkedOutByMe && actions.onDelete && (
                <Button startIcon={<Delete />} onClick={() => actions.onDelete!(whiteboard!)} color="error">
                  {t('pages.whiteboard.state-actions.delete')}
                </Button>
              )}
              <FlexSpacer />
              {lockedBy && (
                <Authorship authorAvatarUri={lockedBy.profile.visual?.uri}>
                  {t('pages.whiteboard.locked-by', { user: lockedBy.profile.displayName })}
                </Authorship>
              )}
              <LoadingButton
                startIcon={whiteboardActions[currentAction].startIcon}
                onClick={() => actionMap[currentAction]?.(whiteboard!)}
                loadingPosition="start"
                variant="contained"
                loading={state?.changingWhiteboardLockState || state?.updatingWhiteboard}
                disabled={whiteboardActions[currentAction].disabled({ isValid })}
              >
                {t(whiteboardActions[currentAction].label)}
              </LoadingButton>
            </Actions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default WhiteboardDialog;

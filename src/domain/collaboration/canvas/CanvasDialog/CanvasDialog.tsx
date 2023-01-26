import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import { FormikProps } from 'formik/dist/types';
import { isEqual } from 'lodash';
import { exportToBlob, serializeAsJSON } from '@alkemio/excalidraw';
import { ExcalidrawAPIRefValue } from '@alkemio/excalidraw/types/types';
import { Delete, Save } from '@mui/icons-material';
import LockClockIcon from '@mui/icons-material/LockClock';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import {
  CanvasCheckoutStateEnum,
  CanvasDetailsFragment,
  CanvasValueFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import TranslationKey from '../../../../types/TranslationKey';
import { Loading } from '../../../../common/components/core';
import { DialogContent } from '../../../../common/components/core/dialog';
import CanvasWhiteboard from '../../../../common/components/composite/entities/Canvas/CanvasWhiteboard';
import { ExportedDataState } from '@alkemio/excalidraw/types/data/types';
import getCanvasBannerCardDimensions from '../utils/getCanvasBannerCardDimensions';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildCanvasUrl } from '../../../../common/utils/urlBuilders';
import UrlParams from '../../../../core/routing/urlParams';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';
import Authorship from '../../../../core/ui/authorship/Authorship';
import { Caption, PageTitle } from '../../../../core/ui/typography';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Box, Button, ButtonProps } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import FlexSpacer from '../../../../core/ui/utils/FlexSpacer';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import canvasSchema from '../validation/canvasSchema';

interface CanvasWithValue extends Omit<CanvasValueFragment, 'id'>, Partial<CanvasDetailsFragment> {}

type CanvasWithoutValue<Canvas extends CanvasWithValue> = Omit<Canvas, 'value'>;

interface CanvasDialogProps<Canvas extends CanvasWithValue> {
  entities: {
    canvas?: Canvas;
  };
  actions: {
    onCancel: (canvas: CanvasWithoutValue<Canvas>) => void;
    onCheckin?: (canvas: CanvasWithoutValue<Canvas>) => void;
    onCheckout?: (canvas: CanvasWithoutValue<Canvas>) => void;
    onUpdate: (canvas: Canvas, previewImage?: Blob) => void;
    onDelete?: (canvas: CanvasWithoutValue<Canvas>) => void;
  };
  options: {
    show: boolean;
    canCheckout?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
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

const getCanvasShareUrl = (urlParams: UrlParams) => {
  if (!urlParams.hubNameId || !urlParams.calloutNameId || !urlParams.canvasNameId) return;

  return buildCanvasUrl(urlParams.calloutNameId, urlParams.canvasNameId, {
    hubNameId: urlParams.hubNameId,
    challengeNameId: urlParams.challengeNameId,
    opportunityNameId: urlParams.opportunityNameId,
  });
};

const CanvasDialog = <Canvas extends CanvasWithValue>({
  entities,
  actions,
  options,
  state,
}: CanvasDialogProps<Canvas>) => {
  const { t } = useTranslation();
  const { canvas } = entities;
  const excalidrawApiRef = useRef<ExcalidrawAPIRefValue>(null);
  const urlParams = useUrlParams();
  const canvasUrl = getCanvasShareUrl(urlParams);

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

    const previewImage = await exportToBlob({
      appState,
      elements,
      files: files ?? null,
      getDimensions: getCanvasBannerCardDimensions(canvas.preview),
      mimeType: 'image/png',
    });

    const value = serializeAsJSON(elements, appState, files ?? {}, 'local');

    if (!formikRef.current?.isValid) {
      return;
    }

    const displayName = formikRef.current?.values.displayName ?? canvas.displayName;

    return actions.onUpdate(
      {
        ...canvas,
        displayName,
        value,
      } as Canvas,
      previewImage ?? undefined
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
      if (!isEqual(canvas?.value, value) || formikRef.current?.dirty) {
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

  const isBeingEdited = canvas?.checkout?.status === CanvasCheckoutStateEnum.CheckedOut || (canvas && !canvas.id);
  const isUnavailable = isBeingEdited && !options.canEdit && Boolean(canvas?.id);
  const currentAction: CanvasAction = isBeingEdited ? 'save-and-checkin' : 'checkout';

  const formikRef = useRef<FormikProps<{ displayName: string }>>(null);

  useEffect(() => {
    formikRef.current?.setFieldValue('displayName', canvas?.displayName);
  }, [canvas?.displayName]);

  const canvasActions: Record<CanvasAction, Option> = {
    'save-and-checkin': {
      label: 'pages.canvas.state-actions.save',
      disabled: ({ isValid }) => !isValid,
      startIcon: <Save />,
    },
    checkout: {
      label: 'pages.canvas.state-actions.check-out',
      disabled: () => isUnavailable,
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
      <Formik
        innerRef={formikRef}
        initialValues={{ displayName: canvas?.displayName ?? '' }}
        onSubmit={() => {}}
        validationSchema={canvasSchema}
      >
        {({ isValid }) => (
          <>
            <DialogHeader
              actions={
                <ShareButton
                  url={canvasUrl}
                  entityTypeName="canvas"
                  disabled={canvas?.checkout?.status !== CanvasCheckoutStateEnum.Available}
                  tooltipIfDisabled={t('share-dialog.canvas-checkedout')}
                />
              }
              onClose={onClose}
            >
              {isBeingEdited ? (
                <Box
                  component={FormikInputField}
                  title={t('fields.displayName')}
                  name="displayName"
                  size="small"
                  maxWidth={gutters(50)}
                />
              ) : (
                <>
                  <Authorship authorAvatarUri={canvas?.createdBy?.profile?.avatar?.uri} date={canvas?.createdDate}>
                    {canvas?.createdBy?.displayName}
                  </Authorship>
                  <PageTitle>{canvas?.displayName}</PageTitle>
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
              {isBeingEdited && actions.onDelete && (
                <Button startIcon={<Delete />} onClick={() => actions.onDelete!(canvas!)} color="error">
                  {t('pages.canvas.state-actions.delete')}
                </Button>
              )}
              <FlexSpacer />
              {isUnavailable && <Caption>Edited by someone else.</Caption>}
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

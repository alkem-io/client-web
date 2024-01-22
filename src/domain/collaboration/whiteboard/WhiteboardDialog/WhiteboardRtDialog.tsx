import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import { FormikProps } from 'formik/dist/types';
import { serializeAsJSON } from '@alkemio/excalidraw';
import { ExcalidrawAPIRefValue } from '@alkemio/excalidraw/types/types';
import Dialog from '@mui/material/Dialog';
import { makeStyles } from '@mui/styles';
import Loading from '../../../../core/ui/loading/Loading';
import { DialogContent } from '../../../../core/ui/dialog/deprecated';
import CollaborativeExcalidrawWrapper from '../../../common/whiteboard/excalidraw/CollaborativeExcalidrawWrapper';
import { ExportedDataState } from '@alkemio/excalidraw/types/data/types';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Box, Button, DialogActions } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';
import whiteboardSchema from '../validation/whiteboardSchema';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import WhiteboardTemplatesLibrary from '../WhiteboardTemplatesLibrary/WhiteboardTemplatesLibrary';
import { WhiteboardTemplateWithContent } from '../WhiteboardTemplateCard/WhiteboardTemplate';
import mergeWhiteboard from '../utils/mergeWhiteboard';
import { error as logError } from '../../../../core/logging/sentry/log';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { WhiteboardRtWithContent, WhiteboardRtWithoutContent } from '../containers/WhiteboardRtContentContainer';
import {
  generateWhiteboardPreviewImages,
  WhiteboardPreviewImage,
} from '../WhiteboardPreviewImages/WhiteboardPreviewImages';
import { Text } from '../../../../core/ui/typography';
import { formatTimeElapsed } from '../../../shared/utils/formatTimeElapsed';
import { useWhiteboardRtLastUpdatedDateQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { CollabAPI } from '../../../common/whiteboard/excalidraw/collab/Collab';
import useWhiteboardFilesManager from '../../../common/whiteboard/excalidraw/useWhiteboardFilesManager';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import WhiteboardDialogFooter from './WhiteboardDialogFooter';
import { useLocation } from 'react-router-dom';

interface WhiteboardDialogProps<Whiteboard extends WhiteboardRtWithContent> {
  entities: {
    whiteboard?: Whiteboard;
  };
  actions: {
    onCancel: (whiteboard: WhiteboardRtWithoutContent<Whiteboard>) => void;
    onUpdate: (
      whiteboard: Whiteboard,
      previewImages?: WhiteboardPreviewImage[]
    ) => Promise<{ success: boolean; errors?: string[] }>;
  };
  options: {
    show: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    headerActions?: ReactNode;
    fixedDialogTitle?: ReactNode;
    fullscreen?: boolean;
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

const WhiteboardRtDialog = <Whiteboard extends WhiteboardRtWithContent>({
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

  const excalidrawApiRef = useRef<ExcalidrawAPIRefValue>(null);
  const collabApiRef = useRef<CollabAPI>(null);
  const [collaborationEnabled, setCollaborationEnabled] = useState(true);
  const [collaborationStoppedNoticeOpen, setCollaborationStoppedNoticeOpen] = useState(false);
  const editModeEnabled = options.canEdit && collaborationEnabled;

  const styles = useStyles();

  const { data: lastSaved, refetch: refetchLastSaved } = useWhiteboardRtLastUpdatedDateQuery({
    variables: { whiteboardId: whiteboard?.id! },
    skip: !whiteboard?.id,
  });

  const lastSavedDate = useMemo(
    () => lastSaved?.lookup.whiteboardRt?.updatedDate && new Date(lastSaved.lookup.whiteboardRt.updatedDate),
    [lastSaved?.lookup.whiteboardRt?.updatedDate]
  );

  const filesManager = useWhiteboardFilesManager({
    excalidrawApi: excalidrawApiRef.current,
    storageBucketId: whiteboard?.profile?.storageBucket.id ?? '',
  });

  const handleUpdate = async (
    whiteboard: WhiteboardRtWithContent,
    state: RelevantExcalidrawState | undefined,
    shouldUploadPreviewImages = false
  ): Promise<{ success: boolean; errors?: string[] }> => {
    if (!state) {
      return { success: false, errors: ['Excalidraw state not defined'] };
    }
    const { appState, elements, files } = await filesManager.removeAllExcalidrawAttachments(state);

    const previewImages = shouldUploadPreviewImages
      ? await generateWhiteboardPreviewImages(whiteboard, state)
      : undefined;

    const content = serializeAsJSON(elements, appState, files ?? {}, 'local');

    if (!formikRef.current?.isValid) {
      return { success: false, errors: ['Form not valid'] };
    }

    const displayName = formikRef.current?.values.displayName ?? whiteboard?.profile?.displayName;

    const result = await actions.onUpdate(
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

    collabApiRef.current?.notifySavedToDatabase(); // Notify rest of the users that I have saved this whiteboard
    await refetchLastSaved(); // And update the caption

    return result;
  };

  const handleSave = async () => {
    const whiteboardApi = await excalidrawApiRef.current?.readyPromise;
    if (!whiteboard || !whiteboardApi) {
      return;
    }
    const content = JSON.parse(whiteboard.content) as RelevantExcalidrawState;
    const state = {
      ...content,
      elements: whiteboardApi.getSceneElements(),
      appState: whiteboardApi.getAppState(),
      files: whiteboardApi.getFiles(),
    };
    await handleUpdate(whiteboard, state, true);
  };

  const onClose = async () => {
    if (editModeEnabled && collaborationEnabled) {
      handleSave();
    }
    actions.onCancel(whiteboard!);
  };

  const handleImportTemplate = async (template: WhiteboardTemplateWithContent) => {
    const whiteboardApi = await excalidrawApiRef.current?.readyPromise;
    if (whiteboardApi) {
      try {
        mergeWhiteboard(whiteboardApi, template.content);
      } catch (err) {
        notify(t('templateLibrary.whiteboardTemplates.errorImporting'), 'error');
        // @ts-ignore
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
    <>
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
                {editModeEnabled && <WhiteboardTemplatesLibrary onImportTemplate={handleImportTemplate} />}
                <span>
                  RT<sup title=":)">beta</sup>
                </span>
              </DialogHeader>
              <DialogContent classes={{ root: styles.dialogContent }}>
                {!state?.loadingWhiteboardValue && whiteboard && (
                  <CollaborativeExcalidrawWrapper
                    entities={{ whiteboard, filesManager }}
                    ref={excalidrawApiRef}
                    collabApiRef={collabApiRef}
                    options={{
                      viewModeEnabled: !editModeEnabled,
                      UIOptions: {
                        canvasActions: {
                          export: {
                            saveFileToDisk: true,
                          },
                        },
                      },
                    }}
                    actions={{
                      onUpdate: state => handleUpdate(whiteboard, state),
                      onSavedToDatabase: () => {
                        refetchLastSaved({
                          whiteboardId: whiteboard.id,
                        });
                      },
                    }}
                    events={{
                      onCollaborationEnabledChange: enabled => {
                        setCollaborationEnabled(enabled);
                        setCollaborationStoppedNoticeOpen(!enabled);
                      },
                    }}
                  />
                )}
                {state?.loadingWhiteboardValue && <Loading text="Loading whiteboard..." />}
              </DialogContent>
              <WhiteboardDialogFooter
                lastSavedDate={lastSavedDate}
                onSave={handleSave}
                canUpdateContent={options.canEdit!}
                updating={state?.updatingWhiteboardContent}
                createdBy={whiteboard?.createdBy}
                contentUpdatePolicy={whiteboard?.contentUpdatePolicy}
              />
            </>
          )}
        </Formik>
      </Dialog>
      <Dialog open={collaborationStoppedNoticeOpen} onClose={() => setCollaborationStoppedNoticeOpen(false)}>
        <DialogHeader title={t('pages.whiteboard.whiteboardDisconnected.title')} />
        <DialogContent>
          <WrapperMarkdown>{t('pages.whiteboard.whiteboardDisconnected.message')}</WrapperMarkdown>
          {lastSavedDate && (
            <Text>
              {t('pages.whiteboard.whiteboardDisconnected.lastSaved', {
                lastSaved: formatTimeElapsed(lastSavedDate, t),
              })}
            </Text>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCollaborationStoppedNoticeOpen(false)}>{t('buttons.ok')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WhiteboardRtDialog;

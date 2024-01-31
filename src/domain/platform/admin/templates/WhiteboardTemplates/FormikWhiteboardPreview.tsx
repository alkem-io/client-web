import { Box, BoxProps, Button, Skeleton, styled } from '@mui/material';
import { useField } from 'formik';
import React, { FC, MouseEventHandler, useMemo, useState } from 'react';
import ExcalidrawWrapper from '../../../../common/whiteboard/excalidraw/ExcalidrawWrapper';
import WhiteboardDialog from '../../../../collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog';
import { useTranslation } from 'react-i18next';
import { BlockTitle } from '../../../../../core/ui/typography';
import { WhiteboardPreviewImage } from '../../../../collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';
import { useFullscreen } from '../../../../../core/ui/fullscreen/useFullscreen';
import { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/types/types';
import useWhiteboardFilesManager from '../../../../common/whiteboard/excalidraw/useWhiteboardFilesManager';

interface FormikWhiteboardPreviewProps extends BoxProps {
  name: string; // Formik fieldName of the Whiteboard content
  previewImagesName?: string; // Formik fieldName of the preview images. Will only be set if this argument is passed
  canEdit: boolean;
  onChangeContent?: (content: string, previewImages?: WhiteboardPreviewImage[]) => void;
  loading?: boolean;
  dialogProps?: {
    title?: string;
  };
}

const EditTemplateButtonContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2.5),
  bottom: theme.spacing(2.5),
  zIndex: 10,
}));

const FormikWhiteboardPreview: FC<FormikWhiteboardPreviewProps> = ({
  name = 'content',
  previewImagesName,
  canEdit,
  onChangeContent,
  loading,
  dialogProps,
  ...containerProps
}) => {
  const { t } = useTranslation();

  const excalidrawAPIState = useState<ExcalidrawImperativeAPI | null>(null);
  const [excalidrawAPI] = excalidrawAPIState;
  const filesManager = useWhiteboardFilesManager({ excalidrawAPI });

  const [field, , helpers] = useField<string>(name); // Whiteboard content JSON string
  const [, , previewImagesField] = useField<WhiteboardPreviewImage[] | undefined>(previewImagesName ?? 'previewImages');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { fullscreen, setFullscreen } = useFullscreen();

  const handleClickEditButton = () => {
    setEditDialogOpen(true);
    helpers.setTouched(true);
  };
  const handleClose = () => {
    setEditDialogOpen(false);
    if (fullscreen) {
      setFullscreen(false);
    }
  };

  const whiteboardFromTemplate = useMemo(() => {
    return {
      id: '__template',
      // Needed to pass yup validation of WhiteboardDialog
      profile: { id: '__templateProfile', displayName: '__template', storageBucket: { id: '' } },
      content: field.value,
    };
  }, [field.value]);

  const preventSubmittingFormOnWhiteboardControlClick: MouseEventHandler = e => e.preventDefault();

  return (
    <Box
      flexGrow={1}
      flexBasis={theme => theme.spacing(60)}
      onClick={editDialogOpen ? undefined : preventSubmittingFormOnWhiteboardControlClick}
      position="relative"
      {...containerProps}
    >
      {!loading ? (
        <>
          <ExcalidrawWrapper
            entities={{
              whiteboard: whiteboardFromTemplate,
              filesManager,
            }}
            excalidrawAPI={excalidrawAPIState}
            actions={{}}
            options={{
              viewModeEnabled: true,
              UIOptions: {
                canvasActions: {
                  export: false,
                },
              },
            }}
          />
          {canEdit ? (
            <>
              <EditTemplateButtonContainer>
                <Button variant="contained" onClick={() => handleClickEditButton()}>
                  {t('buttons.edit')}
                </Button>
              </EditTemplateButtonContainer>
              <WhiteboardDialog
                entities={{
                  whiteboard: whiteboardFromTemplate,
                  lockedBy: undefined,
                }}
                actions={{
                  onCancel: handleClose,
                  onCheckin: undefined,
                  onCheckout: undefined,
                  onUpdate: (whiteboard, previewImages) => {
                    helpers.setValue(whiteboard.content);
                    if (previewImagesName) {
                      previewImagesField.setValue(previewImages);
                    }
                    onChangeContent?.(whiteboard.content, previewImages);
                    setEditDialogOpen(false);
                  },
                  onDelete: undefined,
                }}
                options={{
                  show: editDialogOpen,
                  canCheckout: false,
                  canEdit: true,
                  canDelete: false,
                  checkedOutByMe: true,
                  headerActions: undefined,
                  allowFilesAttached: true,
                  fixedDialogTitle: (
                    <BlockTitle display="flex" alignItems="center">
                      {dialogProps?.title}
                    </BlockTitle>
                  ),
                  fullscreen,
                }}
              />
            </>
          ) : undefined}
        </>
      ) : (
        <Skeleton height="100%" />
      )}
    </Box>
  );
};

export default FormikWhiteboardPreview;

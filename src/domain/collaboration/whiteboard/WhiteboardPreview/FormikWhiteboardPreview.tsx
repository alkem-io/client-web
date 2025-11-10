import { Box, BoxProps, IconButton, Skeleton, styled } from '@mui/material';
import { useField } from 'formik';
import { MouseEventHandler, useMemo, useState, useImperativeHandle, ReactNode } from 'react';
import ExcalidrawWrapper from '@/domain/common/whiteboard/excalidraw/ExcalidrawWrapper';
import SingleUserWhiteboardDialog from '../WhiteboardDialog/SingleUserWhiteboardDialog';
import { BlockTitle } from '@/core/ui/typography';
import { PreviewImageDimensions, WhiteboardPreviewImage } from '../WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';
import type { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import useWhiteboardFilesManager from '@/domain/common/whiteboard/excalidraw/useWhiteboardFilesManager';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditButton from '@/core/ui/actions/EditButton';
import { gutters } from '@/core/ui/grid/utils';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { WhiteboardPreviewSettings } from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import WhiteboardPreviewSettingsButton from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsButton';
import { DefaultWhiteboardPreviewSettings } from '../WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import { VisualType } from '@/core/apollo/generated/graphql-schema';

export interface FormikWhiteboardPreviewRef {
  openEditDialog: () => void;
  closeEditDialog: () => void;
  setEditDialogOpen: (open: boolean) => void;
}

interface FormikWhiteboardPreviewProps extends BoxProps {
  name: string; // Formik fieldName of the Whiteboard content
  previewImagesName?: string; // Formik fieldName of the preview images. Will only be set if this argument is passed
  previewSettingsName?: string; // Formik fieldName of the preview settings. Will only be set if this argument is passed
  previewImagesSettings?: { visualType: VisualType; dimensions: PreviewImageDimensions }[];
  canEdit: boolean;
  editButton?: ReactNode; // Optional custom edit button.
  onChangeContent?: (content: string, previewImages?: WhiteboardPreviewImage[]) => void;
  onDeleteContent?: () => void; // Optionally show Delete button
  loading?: boolean;
  dialogProps?: {
    title?: string;
  };
}

const StyledBoxOverWhiteboard = styled(Box)(() => ({
  position: 'absolute',
  zIndex: 10,
}));

const FormikWhiteboardPreview = ({
  ref,
  name = 'content',
  previewImagesName,
  previewSettingsName,
  previewImagesSettings,
  canEdit,
  editButton,
  onChangeContent,
  onDeleteContent,
  loading,
  dialogProps,
  ...containerProps
}: FormikWhiteboardPreviewProps & {
  ref?: React.Ref<FormikWhiteboardPreviewRef>;
}) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const filesManager = useWhiteboardFilesManager({ excalidrawAPI });

  const [field, , whiteboardContentField] = useField<string>(name); // Whiteboard content JSON string
  const [, , previewImagesField] = useField<WhiteboardPreviewImage[] | undefined>(previewImagesName ?? 'previewImages');
  const [previewSettingsField, , previewSettingsFieldHelpers] = useField<WhiteboardPreviewSettings | undefined>(
    previewSettingsName ?? 'previewSettings'
  );

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewSettingsDialogOpen, setPreviewSettingsDialogOpen] = useState<boolean>(false);
  const { fullscreen, setFullscreen } = useFullscreen();

  useImperativeHandle(
    ref,
    () => ({
      openEditDialog: () => setEditDialogOpen(true),
      closeEditDialog: () => setEditDialogOpen(false),
      setEditDialogOpen, // expose the setter if needed
    }),
    []
  );

  const handleClickEditButton = () => {
    setEditDialogOpen(true);
    whiteboardContentField.setTouched(true);
  };

  const handleClose = () => {
    setEditDialogOpen(false);
    if (fullscreen) {
      setFullscreen(false);
    }
  };

  const [deleteContentConfirmDialogOpen, setDeleteContentConfirmDialogOpen] = useState(false);

  const whiteboardFromTemplate = useMemo(() => {
    return {
      id: '__template',
      nameID: '__template',
      // Needed to pass yup validation of WhiteboardDialog
      profile: { id: '__templateProfile', displayName: '__template', url: '', storageBucket: { id: '' } },
      content: field.value,
      previewSettings: previewSettingsField.value ?? DefaultWhiteboardPreviewSettings,
    };
  }, [field.value, previewSettingsField.value]);

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
            actions={{
              onInitApi: setExcalidrawAPI,
            }}
            options={{
              viewModeEnabled: true,
              UIOptions: {
                canvasActions: {
                  export: false,
                },
              },
            }}
          />
          {onDeleteContent && canEdit && (
            <StyledBoxOverWhiteboard top={0} right={gutters(0.5)}>
              <IconButton onClick={() => setDeleteContentConfirmDialogOpen(true)} sx={{ background: 'white' }}>
                <DeleteOutlinedIcon />
              </IconButton>
            </StyledBoxOverWhiteboard>
          )}
          {canEdit ? (
            <>
              <StyledBoxOverWhiteboard right={theme => theme.spacing(2.5)} bottom={theme => theme.spacing(2.5)}>
                {editButton ? editButton : <EditButton variant="contained" onClick={handleClickEditButton} />}
              </StyledBoxOverWhiteboard>
              <SingleUserWhiteboardDialog
                entities={{
                  whiteboard: whiteboardFromTemplate,
                }}
                actions={{
                  onCancel: handleClose,
                  onUpdate: async (whiteboard, previewImages) => {
                    whiteboardContentField.setValue(whiteboard.content);
                    if (previewImagesName) {
                      previewImagesField.setValue(previewImages);
                    }
                    if (previewSettingsName) {
                      previewSettingsFieldHelpers.setValue(whiteboard.previewSettings);
                    }
                    onChangeContent?.(whiteboard.content, previewImages);
                    setEditDialogOpen(false);
                  },
                  onUpdatePreviewSettings: async previewSettings => {
                    if (previewSettingsName) {
                      previewSettingsFieldHelpers.setValue(previewSettings);
                    }
                  },
                  onClosePreviewSettingsDialog: () => setPreviewSettingsDialogOpen(false),
                  onDelete: undefined,
                }}
                options={{
                  show: editDialogOpen,
                  canEdit: true,
                  canDelete: false,
                  headerActions: (
                    <>
                      {previewSettingsName && (
                        <WhiteboardPreviewSettingsButton onClick={() => setPreviewSettingsDialogOpen(true)} />
                      )}
                    </>
                  ),
                  previewSettingsDialogOpen,
                  previewImagesSettings,
                  allowFilesAttached: true,
                  dialogTitle: (
                    <BlockTitle display="flex" alignItems="center">
                      {dialogProps?.title}
                    </BlockTitle>
                  ),
                  fullscreen,
                }}
              />
            </>
          ) : undefined}
          <ConfirmationDialog
            entities={{
              titleId: 'pages.whiteboard.deleteContent.confirmationTitle',
              contentId: 'pages.whiteboard.deleteContent.confirmationText',
              confirmButtonTextId: 'buttons.yesDelete',
            }}
            options={{
              show: Boolean(onDeleteContent) && deleteContentConfirmDialogOpen,
            }}
            actions={{
              onConfirm: () => {
                whiteboardContentField.setValue('');
                if (previewImagesName) {
                  previewImagesField.setValue([]);
                }
                if (previewSettingsName) {
                  previewSettingsFieldHelpers.setValue(undefined);
                }
                onDeleteContent?.();
                setDeleteContentConfirmDialogOpen(false);
              },
              onCancel: () => setDeleteContentConfirmDialogOpen(false),
            }}
          />
        </>
      ) : (
        <Skeleton height="100%" />
      )}
    </Box>
  );
};

export default FormikWhiteboardPreview;

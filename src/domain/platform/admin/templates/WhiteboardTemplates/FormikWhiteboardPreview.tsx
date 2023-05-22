import { Box, BoxProps, Button, Skeleton, styled } from '@mui/material';
import { useField } from 'formik';
import React, { FC, MouseEventHandler, useMemo, useState } from 'react';
import CanvasWhiteboard from '../../../../../common/components/composite/entities/Canvas/CanvasWhiteboard';
import CanvasDialog from '../../../../collaboration/canvas/CanvasDialog/CanvasDialog';
import { useTranslation } from 'react-i18next';
import { BlockTitle } from '../../../../../core/ui/typography';
import { WhiteboardPreviewImage } from '../../../../collaboration/canvas/WhiteboardPreviewImages/WhiteboardPreviewImages';

interface FormikWhiteboardPreviewProps extends BoxProps {
  name: string; // Formik fieldName of the Canvas value
  previewImagesName?: string; // Formik fieldName of the preview images. Will only be set if this argument is passed
  canEdit: boolean;
  onChangeValue?: (value: string, previewImages?: WhiteboardPreviewImage[]) => void;
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
  name = 'value',
  previewImagesName,
  canEdit,
  onChangeValue,
  loading,
  dialogProps,
  ...containerProps
}) => {
  const { t } = useTranslation();
  const [field, , helpers] = useField<string>(name); // Canvas value JSON string
  const [, , previewImagesField] = useField<WhiteboardPreviewImage[] | undefined>(previewImagesName ?? 'previewImages');

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleClickEditButton = () => {
    setEditDialogOpen(true);
    helpers.setTouched(true);
  };

  const canvasFromTemplate = useMemo(() => {
    return {
      id: '__template',
      // Needed to pass yup validation of CanvasDialog
      profile: { id: '__templateProfile', displayName: '__template' },
      value: field.value,
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
          <CanvasWhiteboard
            entities={{
              canvas: canvasFromTemplate,
            }}
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
              <CanvasDialog
                entities={{
                  canvas: canvasFromTemplate,
                  lockedBy: undefined,
                }}
                actions={{
                  onCancel: () => setEditDialogOpen(false),
                  onCheckin: undefined,
                  onCheckout: undefined,
                  onUpdate: (canvas, previewImages) => {
                    helpers.setValue(canvas.value);
                    if (previewImagesName) {
                      previewImagesField.setValue(previewImages);
                    }
                    onChangeValue?.(canvas.value, previewImages);
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
                  fixedDialogTitle: (
                    <BlockTitle display="flex" alignItems="center">
                      {dialogProps?.title}
                    </BlockTitle>
                  ),
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

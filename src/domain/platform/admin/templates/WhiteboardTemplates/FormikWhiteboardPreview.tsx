import { Box, BoxProps, Button, Skeleton, styled } from '@mui/material';
import { useField } from 'formik';
import React, { FC, MouseEventHandler, useMemo, useState } from 'react';
import CanvasWhiteboard from '../../../../../common/components/composite/entities/Canvas/CanvasWhiteboard';
import CanvasDialog from '../../../../collaboration/canvas/CanvasDialog/CanvasDialog';
import { useTranslation } from 'react-i18next';
import { BlockTitle } from '../../../../../core/ui/typography';
import { PreviewImageDimensions } from '../../../../collaboration/canvas/utils/getCanvasBannerCardDimensions';

interface FormikWhiteboardPreviewProps extends BoxProps {
  name: string; // Formik fieldName of the Canvas value
  canEdit: boolean;
  onChangeValue?: (value: string, previewImage?: Blob) => void;
  loading?: boolean;
  dialogProps?: {
    title?: string;
  };
  previewDimensions?: PreviewImageDimensions;
}

const EditTemplateButtonContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2.5),
  bottom: theme.spacing(2.5),
  zIndex: 10,
}));

const FormikWhiteboardPreview: FC<FormikWhiteboardPreviewProps> = ({
  name,
  canEdit,
  onChangeValue,
  loading,
  dialogProps,
  previewDimensions,
  ...containerProps
}) => {
  const { t } = useTranslation();
  const [field, , helpers] = useField<string>(name); // value JSON string
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
                  onUpdate: (canvas, previewImage) => {
                    helpers.setValue(canvas.value);
                    onChangeValue?.(canvas.value, previewImage);
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
                  previewDimensions,
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

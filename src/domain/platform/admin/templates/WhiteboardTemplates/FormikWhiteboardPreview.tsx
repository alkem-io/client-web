import { Box, BoxProps, Button, Skeleton, styled } from '@mui/material';
import { useField } from 'formik';
import React, { FC, MouseEventHandler, useMemo, useState } from 'react';
import WhiteboardWhiteboard from '../../../../../common/components/composite/entities/Whiteboard/WhiteboardWhiteboard';
import WhiteboardDialog from '../../../../collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog';
import { useTranslation } from 'react-i18next';
import { BlockTitle } from '../../../../../core/ui/typography';
import { WhiteboardPreviewImage } from '../../../../collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';

interface FormikWhiteboardPreviewProps extends BoxProps {
  name: string; // Formik fieldName of the Whiteboard value
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
  const [field, , helpers] = useField<string>(name); // Whiteboard value JSON string
  const [, , previewImagesField] = useField<WhiteboardPreviewImage[] | undefined>(previewImagesName ?? 'previewImages');

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleClickEditButton = () => {
    setEditDialogOpen(true);
    helpers.setTouched(true);
  };

  const whiteboardFromTemplate = useMemo(() => {
    return {
      id: '__template',
      // Needed to pass yup validation of WhiteboardDialog
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
          <WhiteboardWhiteboard
            entities={{
              whiteboard: whiteboardFromTemplate,
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
              <WhiteboardDialog
                entities={{
                  whiteboard: whiteboardFromTemplate,
                  lockedBy: undefined,
                }}
                actions={{
                  onCancel: () => setEditDialogOpen(false),
                  onCheckin: undefined,
                  onCheckout: undefined,
                  onUpdate: (whiteboard, previewImages) => {
                    helpers.setValue(whiteboard.value);
                    if (previewImagesName) {
                      previewImagesField.setValue(previewImages);
                    }
                    onChangeValue?.(whiteboard.value, previewImages);
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

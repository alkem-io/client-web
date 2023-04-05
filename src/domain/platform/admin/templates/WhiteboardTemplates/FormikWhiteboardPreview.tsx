import { Box, Button, Skeleton, styled } from '@mui/material';
import { useField } from 'formik';
import React, { FC, MouseEventHandler, useMemo, useState } from 'react';
import CanvasWhiteboard from '../../../../../common/components/composite/entities/Canvas/CanvasWhiteboard';
import CanvasDialog from '../../../../collaboration/canvas/CanvasDialog/CanvasDialog';
import { useTranslation } from 'react-i18next';
import { BlockTitle } from '../../../../../core/ui/typography';

interface FormikWhiteboardPreviewProps {
  name: string; // Formik fieldName of the Canvas value
  canEdit: boolean;
  loading?: boolean;
}

const EditTemplateButtonContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2.5),
  bottom: theme.spacing(2.5),
  zIndex: 10,
}));

const FormikWhiteboardPreview: FC<FormikWhiteboardPreviewProps> = ({ name, canEdit, loading }) => {
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
                  {t('canvas-templates.edit-template-button')}
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
                  onUpdate: canvas => {
                    helpers.setValue(canvas.value);
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
                      {t('canvas-templates.edit-dialog-title')}
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

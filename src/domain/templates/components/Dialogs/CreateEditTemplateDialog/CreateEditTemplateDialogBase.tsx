import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import BackButton from '@/core/ui/actions/BackButton';
import DeleteButton from '@/core/ui/actions/DeleteButton';
import DialogHeader, { DialogHeaderProps } from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { FormikSubmitButtonPure } from '@/domain/shared/components/forms/FormikSubmitButton';
import { SaveOutlined } from '@mui/icons-material';
import { DialogActions, DialogContent, Box } from '@mui/material';
import { FormikProps } from 'formik/dist/types';
import { ReactNode, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnyTemplateFormSubmittedValues } from '../../Forms/TemplateForm';

export interface TemplateFormActions<T = AnyTemplateFormSubmittedValues> {
  renderActions: (formik: FormikProps<T>) => ReactNode;
  portal: HTMLElement | null;
}

interface TemplateDialogBaseProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onCancel?: () => void;
  editMode?: boolean;
  templateType: TemplateType;
  onDelete?: () => void;
  children?: (props: { actions: TemplateFormActions }) => ReactNode;
}

const CreateEditTemplateDialogBase = ({
  open,
  onClose,
  onCancel,
  children,
  editMode,
  templateType,
  onDelete,
}: TemplateDialogBaseProps) => {
  const { t } = useTranslation();
  const [actionsPortalContainer, setActionsPortalContainer] = useState<HTMLElement | null>(null);

  const handleActionsPortalRef = useCallback((node: HTMLDivElement | null) => {
    setActionsPortalContainer(node);
  }, []);

  const titleLabel = editMode ? 'common.edit-entity' : 'common.create-new-entity';

  return (
    <DialogWithGrid columns={12} open={open} onClose={onClose} aria-labelledby="create-edit-template-dialog">
      <DialogHeader
        id="create-edit-template-dialog"
        title={t(titleLabel, { entity: t(`common.enums.templateType.${templateType}` as const) })}
        onClose={onClose}
      />
      <DialogContent sx={{ paddingTop: 0 }}>
        {children?.({
          /* Actions will be rendered down in the dialog footer, but it needs the formik context */
          actions: {
            portal: actionsPortalContainer,
            renderActions: formik => (
              <DialogActions sx={{ marginLeft: 'auto' }}>
                {editMode && onDelete && <DeleteButton onClick={onDelete} disabled={formik.isSubmitting} />}
                {editMode && onCancel && (
                  <BackButton onClick={onCancel} disabled={formik.isSubmitting}>
                    {t('buttons.cancel')}
                  </BackButton>
                )}
                <FormikSubmitButtonPure
                  variant="contained"
                  formik={formik}
                  onClick={() => formik.handleSubmit()}
                  startIcon={<SaveOutlined />}
                >
                  {t(editMode ? 'common.update' : 'common.create')}
                </FormikSubmitButtonPure>
              </DialogActions>
            ),
          },
        })}
      </DialogContent>
      <DialogFooter>
        <Box ref={handleActionsPortalRef} sx={{ display: 'contents' }} />
      </DialogFooter>
    </DialogWithGrid>
  );
};

export default CreateEditTemplateDialogBase;

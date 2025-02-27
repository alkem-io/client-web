import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import BackButton from '@/core/ui/actions/BackButton';
import DeleteButton from '@/core/ui/actions/DeleteButton';
import DialogHeader, { DialogHeaderProps } from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { FormikSubmitButtonPure } from '@/domain/shared/components/forms/FormikSubmitButton';
import { SaveOutlined } from '@mui/icons-material';
import { DialogActions, DialogContent } from '@mui/material';
import { FormikProps } from 'formik/dist/types';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AnyTemplateFormSubmittedValues } from '../../Forms/TemplateForm';

interface TemplateDialogBaseProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onCancel?: () => void;
  editMode?: boolean;
  templateType: TemplateType;
  onDelete?: () => void;
  children?: (props: { actions: (formik: FormikProps<AnyTemplateFormSubmittedValues>) => ReactNode }) => ReactNode;
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

  const titleLabel = editMode ? 'common.edit-entity' : 'common.create-new-entity';

  return (
    <DialogWithGrid columns={12} open={open} onClose={onClose}>
      <DialogHeader
        title={t(titleLabel, { entity: t(`common.enums.templateType.${templateType}` as const) })}
        onClose={onClose}
      />
      <DialogContent sx={{ paddingTop: 0 }}>
        {children?.({
          actions: formik => (
            <DialogFooter>
              <DialogActions>
                {editMode && onDelete && <DeleteButton onClick={onDelete} />}
                {editMode && onCancel && <BackButton onClick={onCancel}>{t('buttons.cancel')}</BackButton>}
                <FormikSubmitButtonPure
                  variant="contained"
                  formik={formik}
                  onClick={() => formik.handleSubmit()}
                  startIcon={<SaveOutlined />}
                >
                  {t(editMode ? 'common.update' : 'common.create')}
                </FormikSubmitButtonPure>
              </DialogActions>
            </DialogFooter>
          ),
        })}
      </DialogContent>
    </DialogWithGrid>
  );
};

export default CreateEditTemplateDialogBase;

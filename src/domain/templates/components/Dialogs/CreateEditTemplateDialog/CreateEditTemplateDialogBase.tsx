import React, { ReactNode } from 'react';
import { DialogActions, DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik/dist/types';
import DialogHeader, { DialogHeaderProps } from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { FormikSubmitButtonPure } from '../../../../shared/components/forms/FormikSubmitButton';
import DeleteButton from '../../../../shared/components/DeleteButton';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';

interface TemplateDialogBaseProps<Values extends {}> {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  editMode?: boolean;
  templateType: TemplateType;
  onDelete?: () => void;
  children?: (props: { actions: (formik: FormikProps<Values>) => ReactNode }) => ReactNode;
}

const CreateEditTemplateDialogBase = <InitialValues extends {}>({
  open,
  onClose,
  children,
  editMode,
  templateType,
  onDelete,
}: TemplateDialogBaseProps<InitialValues>) => {
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
                <FormikSubmitButtonPure variant="contained" formik={formik} onClick={() => formik.handleSubmit()}>
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

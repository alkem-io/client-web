import { ReactNode } from 'react';

import { useTranslation } from 'react-i18next';
import { DialogActions, DialogContent } from '@mui/material';

import DeleteButton from '../../../../shared/components/DeleteButton';
import DialogWithGrid, { DialogFooter } from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import { FormikSubmitButtonPure } from '../../../../shared/components/forms/FormikSubmitButton';

import { type FormikProps } from 'formik/dist/types';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';

const CreateEditTemplateDialogBase = <InitialValues extends {}>({
  children,
  open,
  editMode,
  templateType,
  onClose,
  onDelete,
}: TemplateDialogBaseProps<InitialValues>) => {
  const { t } = useTranslation('translation', { keyPrefix: 'common' });

  return (
    <DialogWithGrid open={open} columns={12} onClose={onClose}>
      <DialogHeader
        title={t(editMode ? 'edit-entity' : 'create-new-entity', {
          entity: t(`enums.templateType.${templateType}` as const),
        })}
        onClose={onClose}
      />

      <DialogContent sx={{ paddingTop: 0 }}>
        {children?.({
          actions: formik => (
            <DialogFooter>
              <DialogActions>
                {editMode && onDelete && <DeleteButton onClick={onDelete} />}

                <FormikSubmitButtonPure variant="contained" formik={formik} onClick={() => formik.handleSubmit()}>
                  {t(`${editMode ? 'update' : 'create'}`)}
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

type TemplateDialogBaseProps<Values extends {}> = {
  open: boolean;
  templateType: TemplateType;
  onClose: DialogHeaderProps['onClose'];

  editMode?: boolean;
  onDelete?: () => void;
  children?: (props: { actions: (formik: FormikProps<Values>) => ReactNode }) => ReactNode;
};

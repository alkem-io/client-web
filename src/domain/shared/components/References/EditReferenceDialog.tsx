import { FC, ReactNode, useMemo } from 'react';
import { Reference } from '../../../../core/apollo/generated/graphql-schema';
import { Box, Button, Dialog, DialogContent } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import { Formik } from 'formik';
import * as yup from 'yup';
import { referenceSegmentValidationObject } from '../../../platform/admin/components/Common/ReferenceSegment';

export interface EditReferenceFormValues {
  reference: Pick<Reference, 'id' | 'name' | 'uri' | 'description'>;
}

interface EditReferenceDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  reference: EditReferenceFormValues['reference'];
  onSave: (values: EditReferenceFormValues) => Promise<void>;
}

const EditReferenceDialog: FC<EditReferenceDialogProps> = ({ open, onClose, title, reference, onSave }) => {
  const { t } = useTranslation();
  const breakpoint = useCurrentBreakpoint();
  const isMobile = ['xs', 'sm'].includes(breakpoint);

  const initialValues: EditReferenceFormValues = useMemo(() => ({ reference }), [reference]);

  const validationSchema = yup.object().shape({
    reference: referenceSegmentValidationObject,
  });

  return (
    <Dialog open={open} aria-labelledby="reference-creation">
      <DialogHeader onClose={onClose}>{title}</DialogHeader>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          validateOnMount
          onSubmit={() => {}}
        >
          {formikState => {
            const { values } = formikState;

            return (
              <>
                <Gutters>
                  <Gutters row={!isMobile} disablePadding alignItems="start">
                    <FormikInputField name={'reference.name'} title={t('common.title')} fullWidth={isMobile} />
                    <Box display="flex" flexDirection="row">
                      <FormikInputField name={'reference.uri'} title={t('common.url')} attachFile />
                    </Box>
                  </Gutters>
                  <Box>
                    <FormikInputField name={'reference.description'} title={'Description'} />
                  </Box>
                </Gutters>
                <Box display="flex" justifyContent="end">
                  <Button variant="contained" onClick={() => onSave(values)}>
                    {t('buttons.save')}
                  </Button>
                </Box>
              </>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditReferenceDialog;

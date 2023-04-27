import { FC, ReactNode, useMemo } from 'react';
import { Reference } from '../../../../core/apollo/generated/graphql-schema';
import { Box, Button, Dialog, DialogContent, IconButton, Tooltip } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import Gutters from '../../../../core/ui/grid/Gutters';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import { Formik } from 'formik';
import * as yup from 'yup';
import { referenceSegmentSchema } from '../../../platform/admin/components/Common/ReferenceSegment';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export interface ReferenceFormValues extends Pick<Reference, 'name' | 'uri' | 'description'> {}
export interface FormValueType {
  references: ReferenceFormValues[];
}

interface CreateReferencesDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  onSave: (values: FormValueType) => Promise<void>;
}

const fieldName = 'references';
const emptyReference = {
  name: '',
  uri: '',
  description: '',
};

const CreateReferencesDialog: FC<CreateReferencesDialogProps> = ({ open, onClose, title, onSave }) => {
  const { t } = useTranslation();
  const breakpoint = useCurrentBreakpoint();
  const isMobile = ['xs', 'sm'].includes(breakpoint);

  const initialValues: FormValueType = useMemo(
    () => ({
      references: [emptyReference],
    }),
    [emptyReference]
  );

  const validationSchema = yup.object().shape({
    references: referenceSegmentSchema,
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
            const { values, setFieldValue } = formikState;

            const { references } = formikState.values;

            const addAnother = () => {
              setFieldValue(fieldName, [...values.references, emptyReference]);
            };

            return (
              <>
                {references?.map((reference, index) => (
                  <Gutters key={index}>
                    <Gutters row={!isMobile} disablePadding alignItems="start">
                      <FormikInputField
                        name={`${fieldName}.${index}.name`}
                        title={t('common.title')}
                        fullWidth={isMobile}
                      />
                      <Box display="flex" flexDirection="row">
                        <FormikInputField name={`${fieldName}.${index}.uri`} title={t('common.url')} attachFile />
                        <Box>
                          <Tooltip
                            title={t('components.referenceSegment.tooltips.remove-reference') || ''}
                            id={'remove a reference'}
                            placement={'bottom'}
                          >
                            <IconButton
                              aria-label="Remove"
                              onClick={() => {
                                setFieldValue(fieldName, values.references.splice(index, 1));
                              }}
                              size="large"
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Gutters>
                    <Box>
                      <FormikInputField name={`${fieldName}.${index}.description`} title={'Description'} />
                    </Box>
                  </Gutters>
                ))}
                <Box display="flex" justifyContent="end" gap={1}>
                  <Button onClick={addAnother}>{t('callout.link-collection.add-another')}</Button>
                </Box>

                <Box display="flex" justifyContent="end">
                  <Button variant="contained" onClick={() => onSave({ references: values.references })}>
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

export default CreateReferencesDialog;

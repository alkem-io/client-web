import { FC, ReactNode, useMemo } from 'react';
import { CalloutType, Reference } from '../../../../core/apollo/generated/graphql-schema';
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
import AddIcon from '@mui/icons-material/Add';
import { BlockSectionTitle, BlockTitle } from '../../../../core/ui/typography';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import calloutIcons from '../../../collaboration/callout/utils/calloutIcons';

export interface CreateReferenceFormValues extends Pick<Reference, 'name' | 'uri' | 'description'> {}
export interface FormValueType {
  references: CreateReferenceFormValues[];
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

  const CalloutIcon = calloutIcons[CalloutType.LinkCollection];

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
    <Dialog open={open} aria-labelledby="reference-creation" fullWidth maxWidth="lg">
      <DialogHeader onClose={onClose}>
        <Box display="flex" alignItems="center">
          <CalloutIcon sx={{ marginRight: theme => theme.spacing(1) }} />
          <BlockTitle>{title}</BlockTitle>
        </Box>
      </DialogHeader>
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
                      <Box flexGrow={1} width={isMobile ? '100%' : undefined}>
                        <Box display="flex">
                          <FormikInputField
                            name={`${fieldName}.${index}.uri`}
                            title={t('common.url')}
                            fullWidth
                            attachFile
                          />
                          <Box>
                            <Tooltip
                              title={t('components.referenceSegment.tooltips.remove-reference') || ''}
                              id={'remove a reference'}
                              placement={'bottom'}
                            >
                              <IconButton
                                aria-label="Remove"
                                disabled={values.references.length < 2}
                                onClick={() => {
                                  if (values.references.length > 1) {
                                    const nextValue = [...values.references];
                                    nextValue.splice(index, 1);
                                    setFieldValue(fieldName, nextValue);
                                  }
                                }}
                                size="large"
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    </Gutters>
                    <Box>
                      <FormikInputField name={`${fieldName}.${index}.description`} title={'Description'} />
                    </Box>
                  </Gutters>
                ))}
                <Box display="flex" justifyContent="end" padding={gutters()}>
                  <BlockSectionTitle>
                    {t('callout.link-collection.add-another')}
                    <IconButton onClick={addAnother} color="primary">
                      <AddIcon />
                    </IconButton>
                  </BlockSectionTitle>
                </Box>
                <Actions paddingX={gutters()} justifyContent="space-between">
                  <Button onClick={onClose}>{t('buttons.cancel')}</Button>
                  <Button variant="contained" onClick={() => onSave({ references: values.references })}>
                    {t('buttons.save')}
                  </Button>
                </Actions>
              </>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReferencesDialog;

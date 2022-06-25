import React, { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { displayNameValidator } from '../../../../utils/validator';
import { Form, Formik } from 'formik';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, DialogActions, DialogContent, Grid, Typography } from '@mui/material';
import FormRow from '../../../shared/layout/FormLayout';
import FormikInputField from '../../../../components/composite/forms/FormikInputField';
import MarkdownInput from '../../../../components/Admin/Common/MarkdownInput';
import { TagsetField } from '../../../../components/Admin/Common/TagsetSegment';
import { CreateTemplateInfoInput, Visual } from '../../../../models/graphql-schema';
import VisualUpload from '../../../../components/composite/common/VisualUpload/VisualUpload';

export interface AspectTemplateFormValues {
  title: string;
  description: string;
  tags: string[];
  type: string;
  defaultDescription: string;
}

export interface AspectTemplateFormSubmittedValues {
  defaultDescription: string;
  type: string;
  info: CreateTemplateInfoInput;
}

interface AspectTemplateFormProps {
  title: ReactNode;
  initialValues: Partial<AspectTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: AspectTemplateFormSubmittedValues) => void;
  submitButtonText: ReactNode;
}

const AspectTemplateForm = ({ title, initialValues, visual, onSubmit, submitButtonText }: AspectTemplateFormProps) => {
  const { t } = useTranslation();

  const handleSubmit = useCallback((values: Partial<AspectTemplateFormValues>) => {
    const validValues = values as AspectTemplateFormValues; // ensured by yup
    onSubmit({
      type: validValues.type,
      defaultDescription: validValues.defaultDescription,
      info: {
        title: validValues.title,
        tags: validValues.tags,
        description: validValues.description ?? '',
      },
    });
  }, []);

  const validationSchema = yup.object().shape({
    title: displayNameValidator,
    description: yup.string().required(),
    defaultDescription: yup.string().required(),
    type: yup.string().required(),
    tags: yup.array().of(yup.string().min(2)),
  });

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
      {({ isValid }) => (
        <Form>
          <DialogTitle sx={{ marginTop: theme => theme.spacing(3) }}>
            <Typography variant="h3">{title}</Typography>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} paddingTop={1}>
              <FormRow>
                <FormikInputField name="title" title={t('common.title')} />
              </FormRow>
              <FormRow>
                <FormikInputField name="type" title={t('aspect-edit.type.title')} />
              </FormRow>
              <FormRow>
                <FormikInputField name="description" title={t('common.description')} rows={3} multiline />
              </FormRow>
              <FormRow>
                <MarkdownInput name="defaultDescription" label={t('aspect-templates.default-description')} />
              </FormRow>
              <FormRow>
                <TagsetField
                  name="tags"
                  title={t('common.tags')}
                  helpText={t('components.aspect-creation.info-step.tags-help-text')}
                />
              </FormRow>
              {visual && (
                <FormRow>
                  <VisualUpload visual={visual} />
                </FormRow>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button variant="contained" type="submit" disabled={!isValid}>
              {submitButtonText}
            </Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  );
};

export default AspectTemplateForm;

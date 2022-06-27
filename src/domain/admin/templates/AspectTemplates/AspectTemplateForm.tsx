import React, { forwardRef, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { displayNameValidator } from '../../../../utils/validator';
import { Form, Formik, FormikProps } from 'formik';
import DialogTitle from '@mui/material/DialogTitle';
import { DialogActions, DialogContent, InputLabel, InputLabelProps, Typography } from '@mui/material';
import FormikInputField from '../../../../components/composite/forms/FormikInputField';
import { TagsetField } from '../../../../components/Admin/Common/TagsetSegment';
import { CreateTemplateInfoInput, Visual } from '../../../../models/graphql-schema';
import VisualUpload from '../../../../components/composite/common/VisualUpload/VisualUpload';
import FormRows from '../../../shared/components/FormRows';
import FormCols from '../../../shared/components/FormCols';
import FormikMarkdownField from '../../../../components/composite/forms/FormikMarkdownField';

const InputLabelSmall = forwardRef<HTMLLabelElement, InputLabelProps>((props, ref) => (
  <InputLabel ref={ref} shrink {...props} sx={{ marginTop: '-0.5rem' }} />
));

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
  actions: ReactNode | ((formState: FormikProps<AspectTemplateFormValues>) => ReactNode);
}

const AspectTemplateForm = ({ title, initialValues, visual, onSubmit, actions }: AspectTemplateFormProps) => {
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

  const renderActions = typeof actions === 'function' ? actions : () => actions;

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
      {formState => (
        <Form>
          <DialogTitle sx={{ marginTop: theme => theme.spacing(3) }}>
            <Typography variant="h3">{title}</Typography>
          </DialogTitle>
          <DialogContent>
            <FormCols>
              <FormRows>
                <FormikInputField name="title" title={t('common.title')} />
                <FormikMarkdownField
                  name="description"
                  title={t('common.description')}
                  inputLabelComponent={InputLabelSmall}
                />
                <TagsetField
                  name="tags"
                  title={t('common.tags')}
                  helpText={t('components.aspect-creation.info-step.tags-help-text')}
                />
                {visual && <VisualUpload visual={visual} />}
              </FormRows>
              <FormRows>
                <FormikInputField name="type" title={t('aspect-edit.type.title')} />
                <FormikMarkdownField
                  name="defaultDescription"
                  title={t('aspect-templates.default-description')}
                  inputLabelComponent={InputLabelSmall}
                />
              </FormRows>
            </FormCols>
          </DialogContent>
          {actions && <DialogActions sx={{ p: 3 }}>{renderActions(formState)}</DialogActions>}
        </Form>
      )}
    </Formik>
  );
};

export default AspectTemplateForm;

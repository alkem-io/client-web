import React, { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { displayNameValidator } from '../../../../common/utils/validator';
import { Form, Formik, FormikProps } from 'formik';
import { DialogActions, DialogContent, Typography } from '@mui/material';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import { TagsetField } from '../components/Common/TagsetSegment';
import { CreateTemplateInfoInput, Visual } from '../../../../core/apollo/generated/graphql-schema';
import VisualUpload from '../../../../common/components/composite/common/VisualUpload/VisualUpload';
import TemplateFormRows from './TemplateFormRows';
import FormCols from '../../../shared/components/FormCols';
import FormikMarkdownField from '../../../../common/components/composite/forms/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';

export interface TemplateInfoValues {
  title: string;
  description: string;
  tags: string[];
}

export interface TemplateInfoSubmittedValues {
  info: CreateTemplateInfoInput;
}

interface TemplateFormProps<Values extends {}> {
  title: ReactNode;
  initialValues: Partial<Values & TemplateInfoValues>;
  visual?: Visual;
  onSubmit: (values: Values & TemplateInfoSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<Values & TemplateInfoValues>) => ReactNode);
  children: ReactNode | ((formState: FormikProps<Values & TemplateInfoValues>) => ReactNode);
  validator: yup.ObjectSchemaDefinition<Partial<Values>>;
}

const TemplateForm = <Values extends {}>({
  title,
  initialValues,
  visual,
  onSubmit,
  actions,
  children,
  validator,
}: TemplateFormProps<Values>) => {
  const { t } = useTranslation();

  const handleSubmit = useCallback(
    (values: Partial<Values & TemplateInfoValues>) => {
      const { title, tags, description = '', ...validValues } = values as Values & TemplateInfoValues; // ensured by yup
      onSubmit({
        ...validValues,
        info: {
          title,
          tags,
          description,
        },
      } as any);
    },
    [onSubmit]
  );

  const validationSchema = yup.object().shape({
    title: displayNameValidator,
    description: yup.string().required(),
    tags: yup.array().of(yup.string().min(2)),
    ...validator,
  });

  const renderActions = typeof actions === 'function' ? actions : () => actions;
  const renderChildren = typeof children === 'function' ? children : () => children;

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={validationSchema}>
      {formState => (
        <Form>
          <Typography variant="h3" sx={{ px: 3, pt: 5 }}>
            {title}
          </Typography>
          <DialogContent>
            <FormCols>
              <TemplateFormRows>
                <FormikInputField name="title" title={t('common.title')} />
                <FormikMarkdownField
                  name="description"
                  title={t('common.description')}
                  maxLength={MARKDOWN_TEXT_LENGTH}
                  withCounter
                />
                <TagsetField
                  name="tags"
                  title={t('common.tags')}
                  helpTextIcon={t('components.aspect-creation.info-step.tags-help-text')}
                />
                {visual && <VisualUpload visual={visual} />}
              </TemplateFormRows>
              {renderChildren(formState)}
            </FormCols>
          </DialogContent>
          {actions && <DialogActions sx={{ p: 3 }}>{renderActions(formState)}</DialogActions>}
        </Form>
      )}
    </Formik>
  );
};

export default TemplateForm;

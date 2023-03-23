import React, { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { displayNameValidator } from '../../../../common/utils/validator';
import { Form, Formik, FormikProps } from 'formik';
import { DialogActions, DialogContent, Typography } from '@mui/material';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import { TagsetField } from '../components/Common/TagsetSegment';
import VisualUpload from '../../../../common/components/composite/common/VisualUpload/VisualUpload';
import TemplateFormRows from './TemplateFormRows';
import FormCols from '../../../shared/components/FormCols';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { LONG_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { CreateProfileInput, Visual } from '../../../../core/apollo/generated/graphql-schema';

export interface TemplateInfoValues {
  displayName: string;
  description: string;
  tags: string[];
}

export interface TemplateInfoSubmittedValues {
  profile: CreateProfileInput;
  value: string;
  visualUri: string;
}

interface TemplateFormProps<Values extends TemplateInfoValues> {
  title: ReactNode;
  initialValues: Partial<Values>;
  visual?: Visual;
  onSubmit: (values: Values & TemplateInfoSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<Values & TemplateInfoValues>) => ReactNode);
  children: ReactNode | ((formState: FormikProps<Values & TemplateInfoValues>) => ReactNode);
  validator: yup.ObjectSchemaDefinition<Partial<Values>>;
}

const TemplateForm = <Values extends TemplateInfoValues>({
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
      const { displayName, tags, description = '', ...validValues } = values as Values & TemplateInfoValues; // ensured by yup
      onSubmit({
        ...validValues,
        tags,
        profile: {
          displayName,
          description,
        },
      } as Values & TemplateInfoSubmittedValues);
    },
    [onSubmit]
  );

  const validationSchema = yup.object().shape({
    title: displayNameValidator,
    description: MarkdownValidator(LONG_TEXT_LENGTH).required(),
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
                  maxLength={LONG_TEXT_LENGTH}
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

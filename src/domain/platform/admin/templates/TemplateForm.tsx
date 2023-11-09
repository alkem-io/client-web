import React, { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { displayNameValidator } from '../../../../core/ui/forms/validator';
import { Form, Formik, FormikProps } from 'formik';
import { DialogActions, DialogContent } from '@mui/material';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { TagsetField } from '../components/Common/TagsetSegment';
import VisualUpload from '../../../../core/ui/upload/VisualUpload/VisualUpload';
import TemplateFormRows from './TemplateFormRows';
import FormCols from '../../../shared/components/FormCols';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { CreateProfileInput, Visual } from '../../../../core/apollo/generated/graphql-schema';

export interface TemplateProfileValues {
  displayName: string;
  description: string;
  tags: string[];
}

export interface TemplateInfoSubmittedValues {
  profile: CreateProfileInput;
  tags: string[];
}

interface TemplateFormProps<Values extends TemplateProfileValues> {
  initialValues: Partial<Values>;
  visual?: Visual;
  onSubmit: (values: Values & TemplateInfoSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<Values & TemplateProfileValues>) => ReactNode);
  children?: ReactNode | ((formState: FormikProps<Values & TemplateProfileValues>) => ReactNode);
  validator: yup.ObjectSchemaDefinition<Partial<Values>>;
}

const TemplateForm = <Values extends TemplateProfileValues>({
  initialValues,
  visual,
  onSubmit,
  actions,
  children,
  validator,
}: TemplateFormProps<Values>) => {
  const { t } = useTranslation();

  const handleSubmit = useCallback(
    (values: Partial<Values & TemplateProfileValues>) => {
      const { displayName, tags, description = '', ...validValues } = values as Values & TemplateProfileValues; // ensured by yup
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
    displayName: displayNameValidator,
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
    tags: yup.array().of(yup.string().min(2)),
    ...validator,
  });

  const renderActions = typeof actions === 'function' ? actions : () => actions;
  const renderChildren = typeof children === 'function' ? children : () => children;

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {formState => (
        <Form>
          <DialogContent>
            <FormCols>
              <TemplateFormRows>
                <FormikInputField name="displayName" title={t('common.title')} />
                <FormikMarkdownField
                  name="description"
                  title={t('common.description')}
                  maxLength={MARKDOWN_TEXT_LENGTH}
                />
                <TagsetField
                  name="tags"
                  title={t('common.tags')}
                  helpTextIcon={t('components.post-creation.info-step.tags-help-text')}
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

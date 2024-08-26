import React, { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { displayNameValidator } from '../../../../core/ui/forms/validator';
import { Formik, FormikProps } from 'formik';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { TagsetField } from '../components/Common/TagsetSegment';
import VisualUpload from '../../../../core/ui/upload/VisualUpload/VisualUpload';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { CreateProfileInput, Visual } from '../../../../core/apollo/generated/graphql-schema';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import GridContainer from '../../../../core/ui/grid/GridContainer';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import { Box } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import BlockSectionTitleWithIcon from '../../../../core/ui/content/BlockSectionTitleWithIcon';
import { gutters } from '../../../../core/ui/grid/utils';
import { BlockSectionTitle } from '../../../../core/ui/typography';

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
  entityTypeName: ReactNode;
}

const TemplateForm = <Values extends TemplateProfileValues>({
  initialValues,
  visual,
  onSubmit,
  actions,
  children,
  validator,
  entityTypeName,
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
        <GridContainer disablePadding>
          <PageContentColumn columns={3}>
            <PageContentBlockSeamless disablePadding>
              <BlockSectionTitleWithIcon
                icon={<InfoOutlined />}
                tooltip={t('templateDialog.profile.help', { entityTypeName })}
              >
                {t('templateDialog.profile.title')}
              </BlockSectionTitleWithIcon>
              <FormikInputField name="displayName" title={t('templateDialog.profile.fields.displayName')} />
              <Box marginBottom={gutters(-1)}>
                <FormikMarkdownField
                  name="description"
                  title={t('templateDialog.profile.fields.description')}
                  maxLength={MARKDOWN_TEXT_LENGTH}
                />
              </Box>
              <TagsetField
                name="tags"
                title={t('templateDialog.profile.fields.tags')}
                helpTextIcon={t('components.post-creation.info-step.tags-help-text')}
              />
              {visual && <VisualUpload visual={visual} />}
            </PageContentBlockSeamless>
          </PageContentColumn>
          <PageContentColumn columns={9}>
            <PageContentBlockSeamless disablePadding>
              <BlockSectionTitle>{entityTypeName}</BlockSectionTitle>
              {renderChildren(formState)}
            </PageContentBlockSeamless>
          </PageContentColumn>
          {renderActions(formState)}
        </GridContainer>
      )}
    </Formik>
  );
};

export default TemplateForm;

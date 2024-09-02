import React, { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { displayNameValidator } from '../../../../../core/ui/forms/validator';
import { Formik, FormikProps } from 'formik';
import FormikInputField from '../../../../../core/ui/forms/FormikInputField/FormikInputField';
import { TagsetField } from '../../../../platform/admin/components/Common/TagsetSegment';
import VisualUpload from '../../../../../core/ui/upload/VisualUpload/VisualUpload';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import MarkdownValidator from '../../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { TemplateType, Visual } from '../../../../../core/apollo/generated/graphql-schema';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import GridContainer from '../../../../../core/ui/grid/GridContainer';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';
import { Box } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import BlockSectionTitleWithIcon from '../../../../../core/ui/content/BlockSectionTitleWithIcon';
import { gutters } from '../../../../../core/ui/grid/utils';
import { BlockSectionTitle } from '../../../../../core/ui/typography';
import { AnyTemplate } from '../../models/TemplateBase';

export interface TemplateProfileValues {
  displayName: string;
  description: string;
  tags: string[];
}

export interface TemplateFormSubmittedValues {
  // profile: CreateProfileInput;
  // tags?: InputMaybe<Array<Scalars['String']>>;
  // profile?: InputMaybe<UpdateProfileInput>;

  // callout?: InputMaybe<UpdateCalloutInput>;
  // callout?: InputMaybe<CreateCalloutInput>;
  // communityGuidelines?: InputMaybe<UpdateCommunityGuidelinesInput>;
  // communityGuidelinesID?: InputMaybe<Scalars['String']>;
  // communityGuidelines?: InputMaybe<CreateCommunityGuidelinesInput>;
  // innovationFlowStates?: InputMaybe<Array<UpdateInnovationFlowStateInput>>;
  // innovationFlowStates?: InputMaybe<Array<UpdateInnovationFlowStateInput>>;
  // postDefaultDescription?: InputMaybe<Scalars['Markdown']>;
  // postDefaultDescription?: InputMaybe<Scalars['Markdown']>;
  // whiteboard?: InputMaybe<UpdateWhiteboardInput>;
  // whiteboard?: InputMaybe<CreateWhiteboardInput>;


  // id. templatesSetId
  //  type: TemplateType;
  //  visualUri?: InputMaybe<Scalars['String']>;
}

interface TemplateFormProps {
  template?: AnyTemplate;
  onSubmit: (values: TemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<TemplateProfileValues>) => ReactNode);
  children?: ReactNode | ((formState: FormikProps<TemplateProfileValues>) => ReactNode);
  validator?: yup.ObjectSchemaDefinition<{}>;  //!!
  templateType: TemplateType;
}

const TemplateForm = ({
  template,
  onSubmit,
  actions,
  children,
  validator,
  templateType,
}: TemplateFormProps) => {
  const { t } = useTranslation();

  const handleSubmit = useCallback(
    (values: Partial<AnyTemplate>) => {
      const { profile, ...validValues } = values;
      onSubmit({
        ...validValues,
        profile: profile ?? { displayName: '', description: '' },
      });
    },
    [onSubmit]
  );

  const validationSchema = yup.object().shape({
    displayName: displayNameValidator,
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
    tags: yup.array().of(yup.string().min(2)),
    ...validator,
  });

  const visual = template?.profile.visual as Visual | undefined;  //!!

  const initialValues: TemplateProfileValues = {
    displayName: template?.profile.displayName ?? '',
    description: template?.profile.description ?? '',
    tags: template?.profile.tagset?.tags ?? [],
  };

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
                tooltip={t('templateDialog.profile.help', { entityTypeName: t(`common.enums.templateType.${templateType}`) })}
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
              <BlockSectionTitle>{t(`common.enums.templateType.${templateType}`)}</BlockSectionTitle>
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

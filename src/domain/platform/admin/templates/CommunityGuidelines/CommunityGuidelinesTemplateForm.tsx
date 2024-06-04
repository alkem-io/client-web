import { ReactNode } from 'react';
import { Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { CreateProfileInput, Reference, Visual } from '../../../../../core/apollo/generated/graphql-schema';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import FormikInputField from '../../../../../core/ui/forms/FormikInputField/FormikInputField';
import MarkdownValidator from '../../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { MARKDOWN_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import { gutters } from '../../../../../core/ui/grid/utils';
import TemplateForm from '../TemplateForm';
import ProfileReferenceSegment from '../../components/Common/ProfileReferenceSegment';
import { referenceSegmentSchema } from '../../components/Common/ReferenceSegment';

export interface CommunityGuidelinesTemplateFormValues {
  displayName: string;
  description: string;
  tags: string[];
  guidelinesTitle: string;
  guidelinesDescription: string;
  references?: Reference[];
}

export interface CommunityGuidelinesTemplateFormSubmittedValues {
  guidelinesDescription: string;
  guidelinesTitle: string;
  references?: Reference[];
  profile?: CreateProfileInput;
  tags?: string[];
  visualUri?: string;
}

interface CommunityGuidelinesTemplateFormProps {
  initialValues: Partial<CommunityGuidelinesTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: CommunityGuidelinesTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<CommunityGuidelinesTemplateFormValues>) => ReactNode);
}

const validator = {
  displayName: yup.string().required(),
  description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
  referencesData: referenceSegmentSchema,
};

const validationSchema = yup.object().shape({
  guidelines: yup.object().shape({
    profile: yup.object().shape({
      displayName: yup.string().required(),
      description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
      referencesData: referenceSegmentSchema,
    }),
  }),
});

const CommunityGuidelinesTemplateForm = ({
  initialValues,
  visual,
  onSubmit,
  actions,
}: CommunityGuidelinesTemplateFormProps) => {
  const { t } = useTranslation();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={onSubmit}
    >
      {({ values }) => (
        <TemplateForm
          initialValues={initialValues}
          visual={visual}
          onSubmit={onSubmit}
          actions={actions}
          validator={validator}
          entityTypeName={t('templateLibrary.communityGuidelinesTemplates.name')}
        >
          <FormikInputField
            name="guidelines.profile.displayName"
            title={t('templateLibrary.communityGuidelinesTemplates.guidelinesTitle')}
          />
          <FormikMarkdownField
            name="guidelines.profile.description"
            title={t('templateLibrary.communityGuidelinesTemplates.guidelinesDescription')}
            maxLength={MARKDOWN_TEXT_LENGTH}
          />
          <ProfileReferenceSegment
            compactMode
            references={values.references || []}
            profileId={'277c8772-e4b3-45cb-8e0b-11bf81d52347'}
            marginTop={gutters(-1)}
          />
        </TemplateForm>
      )}
    </Formik>
  );
};

export default CommunityGuidelinesTemplateForm;

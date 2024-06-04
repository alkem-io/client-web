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
import { StorageConfigContextProvider } from '../../../../storage/StorageBucket/StorageConfigContext';
import { referenceSegmentSchema } from '../../components/Common/ReferenceSegment';
import { useSpace } from '../../../../journey/space/SpaceContext/useSpace';
import FormikReferenceSegment from '../../components/Common/FormikReferenceSegment';

export interface CommunityGuidelinesTemplateFormValues {
  displayName: string;
  description: string;
  tags: string[];
  guidelinesTitle: string;
  guidelinesDescription: string;
  references?: Reference[];
}

export interface CommunityGuidelinesTemplateFormSubmittedValues {
  guidelinesDescription?: string;
  guidelinesTitle?: string;
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
  guidelinesTemplateId?: string;
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
  guidelinesTemplateId,
}: CommunityGuidelinesTemplateFormProps) => {
  const { t } = useTranslation();
  const { spaceId } = useSpace();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue }) => (
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
          <StorageConfigContextProvider
            locationType="guidelinestemplate"
            spaceId={spaceId}
            guidelinesTemplateId={guidelinesTemplateId}
          >
            <FormikReferenceSegment
              compactMode
              references={values.references ?? []}
              marginTop={gutters(-1)}
              setFieldValue={setFieldValue}
            />
          </StorageConfigContextProvider>
        </TemplateForm>
      )}
    </Formik>
  );
};

export default CommunityGuidelinesTemplateForm;
